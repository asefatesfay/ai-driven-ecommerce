"""AI Assistant core — FastAPI app served on internal port 9000.

The Go API gateway (port 8088) proxies external traffic here.
"""
from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, search, index

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

app = FastAPI(
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
        "bedrock_model": os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-haiku-20241022-v1:0"),
        "chroma_host": os.getenv("CHROMA_HOST", "localhost"),
        "catalog_indexed": collection_count(),
    }
