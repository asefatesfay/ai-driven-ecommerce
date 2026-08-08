"""AWS Bedrock Claude — editorial copy generation."""
from __future__ import annotations

import json
import logging
import os

from langchain_aws import ChatBedrockConverse
from langchain.schema import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from app.models.schemas import Attribution, ProductContext, CopyVariant

logger = logging.getLogger(__name__)

AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
BEDROCK_MODEL_ID = os.getenv(
    "BEDROCK_MODEL_ID",
    "anthropic.claude-3-5-sonnet-20241022-v2:0",  # Sonnet for richer copy quality
)

# ── Per-attribution persona prompts ──────────────────────────────────────────

_PERSONAS: dict[Attribution, str] = {
    "fashion-office": (
        "You are the Fashion Office editorial voice for a premium department store. "
        "Write with insider authority, trend awareness, and aspirational energy. "
        "Use sensory language and specific details. Sound like a Vogue editor who "
        "genuinely uses the product, not a press release."
    ),
    "buyer": (
        "You are a senior merchandise buyer writing internal editorial copy. "
        "Your voice blends value conviction with product expertise. "
        "Explain exactly why you chose this for the edit — quality, price-value, "
        "versatility, or a specific standout feature. Be direct and credible."
    ),
    "stylist": (
        "You are a personal stylist writing editorial copy for clients. "
        "Write in first-person plural ('we') with warmth and intimacy. "
        "Focus on how the product feels, how to use it, and the emotional payoff. "
        "Make the reader feel like you're personally recommending this to them."
    ),
    "customer-loved": (
        "You write editorial copy grounded in customer love — ratings, reviews, and "
        "repeat-purchase signals. Your voice is community-driven and trustworthy. "
        "Translate review sentiment ('people can't stop talking about...') into "
        "editorial authority. Use social proof language without quoting directly."
    ),
}

_BASE_SYSTEM = """You generate editorial gift copy for a premium ecommerce store.
Rules:
- Headline: ≤ 10 words, no brand name, evocative hook
- Body: conversational, editorial, no generic adjectives (avoid: amazing, great, perfect)
- Never mention price in the copy
- No exclamation marks
- Output ONLY valid JSON matching the schema — no markdown, no explanation"""


def _build_prompt(
    product: ProductContext,
    attribution: Attribution,
    themes: list[str],
    price_range: str,
    max_words: int,
    num_variants: int,
) -> str:
    sale_note = f" (on sale from ${product.price:.0f})" if product.sale_price else ""
    recipient_str = ", ".join(product.recipients) if product.recipients else "anyone"
    color_str = ", ".join(product.colors[:4]) if product.colors else ""
    theme_str = ", ".join(themes) if themes else "unspecified"

    return f"""Generate {num_variants} editorial copy variants for this product.

Product: {product.brand} — {product.name}
Description: {product.description}
Category: {product.category}
Price range: {price_range}{sale_note}
Gift recipients: {recipient_str}
Colors available: {color_str}
Themes: {theme_str}
Rating: {product.rating}/5 ({product.review_count:,} reviews)
Attribution voice: {attribution}
Max body words: {max_words}

Return JSON exactly:
{{
  "variants": [
    {{
      "headline": "<10-word hook>",
      "body": "<editorial copy, {max_words} words max>",
      "tone_notes": "<1 sentence: why this angle>",
      "attribution": "{attribution}"
    }}
  ]
}}"""


def _get_llm() -> ChatBedrockConverse:
    return ChatBedrockConverse(
        model=BEDROCK_MODEL_ID,
        region_name=AWS_REGION,
        max_tokens=2048,
        temperature=0.85,  # higher temp = more creative copy variety
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
def generate_variants(
    product: ProductContext,
    attribution: Attribution,
    themes: list[str],
    price_range: str,
    max_words: int,
    num_variants: int,
) -> list[CopyVariant]:
    persona = _PERSONAS[attribution]
    system = f"{_BASE_SYSTEM}\n\nVoice persona:\n{persona}"

    llm = _get_llm()
    prompt = _build_prompt(
        product, attribution, themes, price_range, max_words, num_variants
    )

    response = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content=prompt),
    ])

    text = response.content.strip()
    # strip any markdown code fences Claude might add despite instructions
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    data = json.loads(text)
    variants = []
    for v in data.get("variants", []):
        variants.append(CopyVariant(
            headline=v.get("headline", ""),
            body=v.get("body", ""),
            attribution=attribution,
            tone_notes=v.get("tone_notes", ""),
        ))
    return variants[:num_variants]
