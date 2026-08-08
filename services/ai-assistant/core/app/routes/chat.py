from __future__ import annotations

import logging
import re
import json

from fastapi import APIRouter, HTTPException

from app.embeddings.chroma import semantic_search
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ProductRecommendation,
    AssistantAction,
)
from app.services.bedrock import chat, build_context_string

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


def _extract_json_blocks(text: str) -> list[dict]:
    """Pull all ```json ... ``` blocks out of Claude's response."""
    pattern = r"```json\s*(.*?)\s*```"
    matches = re.findall(pattern, text, re.DOTALL)
    parsed = []
    for m in matches:
        try:
            parsed.append(json.loads(m))
        except json.JSONDecodeError:
            pass
    return parsed


def _strip_json_blocks(text: str) -> str:
    return re.sub(r"```json\s*.*?\s*```", "", text, flags=re.DOTALL).strip()


@router.post("", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
    try:
        # Use the customer's message as a semantic search query to ground the response
        similar_products = semantic_search(req.message, n_results=5)
        context_str = build_context_string(
            cart_items=req.context.cart_items if req.context else [],
            viewed=req.context.viewed_at if req.context else [],
            search_results=[p.model_dump() for p in similar_products],
        )

        raw_response = chat(
            history=req.history,
            user_message=req.message,
            context_str=context_str,
        )

        # Parse structured outputs Claude embedded in the response
        json_blocks = _extract_json_blocks(raw_response)
        clean_message = _strip_json_blocks(raw_response)

        recommendations: list[ProductRecommendation] = []
        actions: list[AssistantAction] = []

        for block in json_blocks:
            for rec in block.get("recommendations", []):
                # Match style_id back to a search result for full details
                matched = next(
                    (p for p in similar_products if p.style_id == rec.get("style_id")),
                    None,
                )
                if matched:
                    recommendations.append(
                        ProductRecommendation(
                            style_id=matched.style_id,
                            name=matched.name,
                            brand=matched.brand,
                            price=matched.price,
                            image_url=matched.image_url,
                            reason=rec.get("reason", ""),
                            score=matched.score,
                        )
                    )
            for action in block.get("actions", []):
                actions.append(
                    AssistantAction(
                        type=action.get("type", ""),
                        payload=action.get("payload", {}),
                    )
                )

        return ChatResponse(
            session_id=req.session_id,
            message=clean_message,
            recommendations=recommendations,
            actions=actions,
        )

    except Exception as e:
        logger.exception("chat error")
        raise HTTPException(status_code=500, detail=str(e))
