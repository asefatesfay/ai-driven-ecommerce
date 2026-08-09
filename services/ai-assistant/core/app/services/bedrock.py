"""AWS Bedrock Claude client via LangChain."""
from __future__ import annotations

import json
import logging
import os
from typing import Any

import boto3
from langchain_aws import ChatBedrockConverse
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from app.models.schemas import Message

logger = logging.getLogger(__name__)

AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
BEDROCK_MODEL_ID = os.getenv(
    "BEDROCK_MODEL_ID",
    "us.anthropic.claude-haiku-4-5-20251001-v1:0",
)

SYSTEM_PROMPT = """You are an expert AI shopping assistant for a premium ecommerce store.
You help customers find products, answer questions about sizing, fit, materials, and styling.
You compare items and give personalized recommendations.

Rules:
- Be helpful, concise, and enthusiastic
- When you recommend specific products, include their style IDs in a JSON block at the end like:
  ```json
  {"recommendations": [{"style_id": "...", "reason": "..."}]}
  ```
- If the customer wants to take an action (add to cart, filter), include:
  ```json
  {"actions": [{"type": "add_to_cart", "payload": {"style_id": "..."}}]}
  ```
- Keep answers under 200 words unless the customer asks for detail"""


def _get_llm() -> ChatBedrockConverse:
    return ChatBedrockConverse(
        model=BEDROCK_MODEL_ID,
        region_name=AWS_REGION,
        max_tokens=1024,
        temperature=0.7,
    )


def _build_messages(
    history: list[Message],
    user_message: str,
    context_str: str = "",
) -> list[Any]:
    msgs: list[Any] = [SystemMessage(content=SYSTEM_PROMPT)]
    for h in history[-10:]:  # keep last 10 turns
        if h.role == "user":
            msgs.append(HumanMessage(content=h.content))
        else:
            msgs.append(AIMessage(content=h.content))

    final = user_message
    if context_str:
        final = f"{context_str}\n\nCustomer: {user_message}"
    msgs.append(HumanMessage(content=final))
    return msgs


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
def chat(
    history: list[Message],
    user_message: str,
    context_str: str = "",
) -> str:
    llm = _get_llm()
    messages = _build_messages(history, user_message, context_str)
    response = llm.invoke(messages)
    return response.content


def build_context_string(
    cart_items: list[str],
    viewed: list[str],
    search_results: list[dict[str, Any]] | None = None,
) -> str:
    parts: list[str] = []
    if cart_items:
        parts.append(f"Customer's cart contains style IDs: {', '.join(cart_items)}")
    if viewed:
        parts.append(f"Recently viewed style IDs: {', '.join(viewed[:5])}")
    if search_results:
        items_str = "; ".join(
            f"{r['name']} by {r['brand']} (${r['price']:.2f}, ID: {r['style_id']})"
            for r in search_results[:5]
        )
        parts.append(f"Relevant products from catalog: {items_str}")
    return "\n".join(parts)


def generate_search_query_expansion(query: str) -> dict[str, Any]:
    """Use Claude to expand a search query into structured filters."""
    llm = _get_llm()
    prompt = f"""A customer is searching for: "{query}"

Respond ONLY with valid JSON, no explanation:
{{
  "expanded_queries": ["<rewritten query 1>", "<rewritten query 2>"],
  "categories": ["<category>"],
  "price_range": {{"min": null, "max": null}},
  "recipients": [],
  "keywords": ["<keyword>"]
}}"""
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        text = response.content
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"expanded_queries": [query], "keywords": [query]}
