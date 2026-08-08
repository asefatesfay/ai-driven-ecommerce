from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.bedrock import generate_variants

router = APIRouter(prefix="/generate", tags=["generate"])
logger = logging.getLogger(__name__)


@router.post("", response_model=GenerateResponse)
async def generate(req: GenerateRequest) -> GenerateResponse:
    try:
        variants = generate_variants(
            product=req.product,
            attribution=req.attribution,
            themes=req.themes,
            price_range=req.price_range,
            max_words=req.max_words,
            num_variants=req.num_variants,
        )
        return GenerateResponse(
            style_id=req.product.style_id,
            variants=variants,
            attribution=req.attribution,
        )
    except Exception as e:
        logger.exception("generation failed for %s", req.product.style_id)
        raise HTTPException(status_code=500, detail=str(e))
