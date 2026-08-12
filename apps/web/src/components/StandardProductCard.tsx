"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CatalogProduct } from "@/lib/catalog-data";
import ColorSwatches from "./ColorSwatches";

// Soft pill colors matching Nordstrom's badge style (coloured background, not solid black)
const BADGE_COLORS: Record<string, string> = {
  "sale":               "bg-[#FDE8E8] text-[#C81E1E]",
  "new-markdown":       "bg-[#FDE8E8] text-[#C81E1E]",
  "anniversary-sale":   "bg-[#FEF3C7] text-[#92400E]",
  "best-seller":        "bg-[#E8F0FE] text-[#1A56DB]",
  "top-rated":          "bg-[#E8F0FE] text-[#1A56DB]",
  "beauty-exclusive":   "bg-[#F3E8FF] text-[#6B21A8]",
  "gift-with-purchase": "bg-[#D1FAE5] text-[#065F46]",
};

export default function StandardProductCard({ product }: { product: CatalogProduct }) {
  const [wished, setWished] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const isOnSale = !!product.salePrice;
  const displayPrice = product.salePrice ?? product.price;

  const badgeStyle = product.badgeType
    ? (BADGE_COLORS[product.badgeType] ?? "bg-gray-100 text-gray-700")
    : "bg-gray-100 text-gray-700";

  return (
    <article className="group flex flex-col">
      <Link href={`/product?style_id=${product.id}`} className="contents">

        {/* ── Image — 4:5 ratio matching Nordstrom ────────── */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F3] mb-3">
          <Image
            src={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Wishlist — circular white button, top-right */}
          <button
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            onClick={(e) => { e.preventDefault(); setWished(!wished); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow z-10"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={wished ? "#1a1a1a" : "none"}
              stroke="#1a1a1a"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* "New" text badge — image overlay, only for new items */}
          {product.badgeType === "new-markdown" && (
            <div className="absolute top-2 left-2 bg-nordstrom-black text-white text-[10px] tracking-widest uppercase px-2 py-0.5 z-10">
              New
            </div>
          )}
        </div>

        {/* ── Color swatches — between image and text, exactly like Nordstrom ── */}
        {product.colors.length > 0 && (
          <div className="mb-2 px-0.5">
            <ColorSwatches
              colors={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>
        )}

        {/* ── Text block ───────────────────────────────────── */}
        <div className="flex flex-col gap-0.5 px-0.5">

          {/* "BRAND Name" on one line — brand bold, name normal — exactly Nordstrom style */}
          <p className="text-sm text-nordstrom-black leading-snug line-clamp-2">
            <span className="font-semibold">{product.brand}</span>
            {" "}
            <span className="font-normal">{product.name}</span>
          </p>

          {/* Price */}
          <div className="mt-0.5">
            {isOnSale ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-red-600">${displayPrice.toFixed(2)}</span>
                <span className="text-xs text-nordstrom-gray-400 line-through">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-nordstrom-black">${displayPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Soft-pill badge below price — "Gift with Purchase", "Best Seller", etc. */}
          {product.badge && product.badgeType !== "new-markdown" && (
            <span className={`self-start text-[10px] font-medium px-2 py-0.5 rounded-sm mt-0.5 ${badgeStyle}`}>
              {product.badge}
            </span>
          )}

          {/* Rating — single filled star + number + (count) */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A951" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[12px] text-nordstrom-black leading-none">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-[12px] text-nordstrom-gray-500 leading-none">
                  ({product.reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}


        </div>
      </Link>
    </article>
  );
}
