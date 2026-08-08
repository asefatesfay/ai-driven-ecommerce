from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.embeddings.chroma import index_products, collection_count
from app.models.schemas import IndexProductRequest, IndexResponse

router = APIRouter(prefix="/index", tags=["index"])
logger = logging.getLogger(__name__)


@router.post("", response_model=IndexResponse)
async def index_products_endpoint(req: IndexProductRequest) -> IndexResponse:
    try:
        count = index_products(req.products)
        return IndexResponse(indexed=count, collection="products")
    except Exception as e:
        logger.exception("index error")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def index_stats() -> dict:
    return {"collection": "products", "count": collection_count()}
