"""AI Assistant core — FastAPI app served on internal port 19010.

The Go API gateway (port 8088) proxies external traffic here.
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, search, index

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)

CATALOG_URL = os.getenv("CATALOG_URL", "http://localhost:8081")


async def _sync_catalog() -> None:
    """Fetch all products from the catalog and index them into ChromaDB."""
    from app.embeddings.chroma import index_products, collection_count
    from app.models.schemas import ProductDocument

    if collection_count() > 0:
        logger.info("catalog already indexed (%d products), skipping", collection_count())
        return

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{CATALOG_URL}/api/v1/products?page_size=200")
            resp.raise_for_status()
            data = resp.json()

        products = [
            ProductDocument(
                style_id=p["style_id"],
                name=p["name"],
                brand=p["brand"],
                description=p.get("description", ""),
                category=p.get("category", ""),
                price=float(p.get("price", 0)),
                image_url=p.get("image_url", ""),
                recipients=p.get("recipients", []),
                colors=[c["name"] if isinstance(c, dict) else c for c in p.get("colors", [])],
                sizes=p.get("sizes", []),
            )
            for p in data.get("products", [])
        ]

        count = index_products(products)
        logger.info("indexed %d products into ChromaDB on startup", count)
    except Exception as e:
        logger.warning("catalog sync failed on startup (will retry on next request): %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _sync_catalog()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="AI Assistant Core",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(index.router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict:
    from app.embeddings.chroma import collection_count
    return {
        "status": "ok",
        "service": "ai-assistant-core",
        "bedrock_model": os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-haiku-4-5-20251001-v1:0"),
        "chroma_host": os.getenv("CHROMA_HOST", "localhost"),
        "catalog_indexed": collection_count(),
    }
