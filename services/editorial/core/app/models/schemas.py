from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field

Attribution = Literal["fashion-office", "buyer", "stylist", "customer-loved"]
Theme = Literal["cozy", "luxury", "practical", "outdoor", "wellness", "host-gift", "stocking-stuffer"]
PriceRange = Literal["under-50", "50-100", "100-200", "200-plus"]


class ProductContext(BaseModel):
    """Product data fed into the generator — fetched from catalog service."""
    style_id: str
    brand: str
    name: str
    description: str
    category: str
    price: float
    sale_price: float | None = None
    rating: float = 0.0
    review_count: int = 0
    recipients: list[str] = Field(default_factory=list)
    colors: list[str] = Field(default_factory=list)


class GenerateRequest(BaseModel):
    product: ProductContext
    attribution: Attribution
    themes: list[Theme] = Field(default_factory=list)
    price_range: PriceRange
    max_words: int = Field(default=60, ge=20, le=120)
    num_variants: int = Field(default=3, ge=1, le=5)


class CopyVariant(BaseModel):
    headline: str        # short hook, ≤ 10 words
    body: str            # editorial copy body
    attribution: Attribution
    tone_notes: str      # brief internal note on why this tone was chosen


class GenerateResponse(BaseModel):
    style_id: str
    variants: list[CopyVariant]
    attribution: Attribution
