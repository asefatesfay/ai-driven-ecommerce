from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class Message(BaseModel):
    role: str  # user | assistant
    content: str


class ConversationContext(BaseModel):
    user_id: int | None = None
    session_id: str
    cart_items: list[str] = Field(default_factory=list)   # style IDs in cart
    viewed_at: list[str] = Field(default_factory=list)    # recently viewed style IDs


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list[Message] = Field(default_factory=list)
    context: ConversationContext | None = None


class ProductRecommendation(BaseModel):
    style_id: str
    name: str
    brand: str
    price: float
    image_url: str
    reason: str
    score: float


class AssistantAction(BaseModel):
    type: str  # add_to_cart | view_product | apply_filter
    payload: dict[str, Any]


class ChatResponse(BaseModel):
    session_id: str
    message: str
    recommendations: list[ProductRecommendation] = Field(default_factory=list)
    actions: list[AssistantAction] = Field(default_factory=list)


class SearchRequest(BaseModel):
    query: str
    session_id: str
    user_id: int | None = None
    max_items: int = 10


class SearchResult(BaseModel):
    style_id: str
    name: str
    brand: str
    price: float
    image_url: str
    category: str
    score: float
    description: str


class SearchResponse(BaseModel):
    query: str
    session_id: str
    results: list[SearchResult]
    total: int


class IndexProductRequest(BaseModel):
    products: list[ProductDocument]


class ProductDocument(BaseModel):
    style_id: str
    name: str
    brand: str
    description: str
    category: str
    price: float
    image_url: str
    recipients: list[str] = Field(default_factory=list)
    colors: list[str] = Field(default_factory=list)
    sizes: list[str] = Field(default_factory=list)


class IndexProductRequest(BaseModel):
    products: list[ProductDocument]


class IndexResponse(BaseModel):
    indexed: int
    collection: str
