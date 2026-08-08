from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.embeddings.chroma import semantic_search, collection_count
from app.models.schemas import SearchRequest, SearchResponse
from app.services.bedrock import generate_search_query_expansion

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)


@router.post("", response_model=SearchResponse)
async def search_endpoint(req: SearchRequest) -> SearchResponse:
    try:
        # Expand the query with Claude for better recall
        expansion = generate_search_query_expansion(req.query)
        expanded_queries = expansion.get("expanded_queries", [req.query])

        # Run semantic search on the primary expanded query
        primary_query = expanded_queries[0] if expanded_queries else req.query
        results = semantic_search(primary_query, n_results=req.max_items)

        # Deduplicate by style_id keeping highest score
        seen: dict[str, int] = {}
        deduped = []
        for r in results:
            if r.style_id not in seen:
                seen[r.style_id] = len(deduped)
                deduped.append(r)

        return SearchResponse(
            query=req.query,
            session_id=req.session_id,
            results=deduped[: req.max_items],
            total=len(deduped),
        )

    except Exception as e:
        logger.exception("search error")
        raise HTTPException(status_code=500, detail=str(e))
