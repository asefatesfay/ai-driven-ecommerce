"""ChromaDB client — product catalog vector store."""
from __future__ import annotations

import os
import logging
from typing import Any

import chromadb
from chromadb.config import Settings

from app.models.schemas import ProductDocument, SearchResult

logger = logging.getLogger(__name__)

COLLECTION_NAME = "products"
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8200"))


def _get_client() -> chromadb.HttpClient:
    return chromadb.HttpClient(
        host=CHROMA_HOST,
        port=CHROMA_PORT,
        settings=Settings(anonymized_telemetry=False),
    )


def _get_collection(client: chromadb.HttpClient) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def index_products(products: list[ProductDocument]) -> int:
    """Upsert products into ChromaDB. Returns count indexed."""
    client = _get_client()
    collection = _get_collection(client)

    ids, documents, metadatas = [], [], []
    for p in products:
        doc_text = (
            f"{p.brand} {p.name}. {p.description}. "
            f"Category: {p.category}. "
            f"Price: ${p.price:.2f}. "
            f"Colors: {', '.join(p.colors)}. "
            f"Sizes: {', '.join(p.sizes)}. "
            f"Recipients: {', '.join(p.recipients)}."
        )
        ids.append(p.style_id)
        documents.append(doc_text)
        metadatas.append({
            "style_id": p.style_id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "image_url": p.image_url,
            "recipients": ",".join(p.recipients),
        })

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    logger.info("indexed %d products into chroma", len(products))
    return len(products)


def semantic_search(
    query: str,
    n_results: int = 10,
    where: dict[str, Any] | None = None,
) -> list[SearchResult]:
    """Query ChromaDB by natural language. Returns ranked results."""
    client = _get_client()
    collection = _get_collection(client)

    kwargs: dict[str, Any] = {
        "query_texts": [query],
        "n_results": min(n_results, collection.count() or 1),
        "include": ["documents", "metadatas", "distances"],
    }
    if where:
        kwargs["where"] = where

    results = collection.query(**kwargs)

    search_results: list[SearchResult] = []
    if not results["ids"] or not results["ids"][0]:
        return search_results

    for i, meta in enumerate(results["metadatas"][0]):
        distance = results["distances"][0][i] if results["distances"] else 0.0
        score = round(1.0 - float(distance), 4)
        search_results.append(
            SearchResult(
                style_id=meta.get("style_id", ""),
                name=meta.get("name", ""),
                brand=meta.get("brand", ""),
                price=float(meta.get("price", 0)),
                image_url=meta.get("image_url", ""),
                category=meta.get("category", ""),
                description=results["documents"][0][i] if results["documents"] else "",
                score=score,
            )
        )
    return search_results


def collection_count() -> int:
    try:
        client = _get_client()
        return _get_collection(client).count()
    except Exception:
        return 0
