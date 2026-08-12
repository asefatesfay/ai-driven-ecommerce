"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditorialProduct } from "@/lib/data";
import { useCart } from "@/lib/CartContext";
import { ATTRIBUTION_LABELS } from "@/lib/data";
import ColorSwatches from "./ColorSwatches";

const ATTRIBUTION_BADGE: Record<EditorialProduct["attribution"], string> = {
  "fashion-office": "bg-[#F3E8FF] text-[#6B21A8]",
  "buyer":          "bg-[#E8F0FE] text-[#1A56DB]",
  "stylist":        "bg-[#D1FAE5] text-[#065F46]",
};

interface EditorialProductCardProps {
  product: EditorialProduct;
}

export default function EditorialProductCard({ product }: EditorialProductCardProps) {
  const [wished, setWished] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();

  const displayPrice = product.salePrice ?? product.price;
  const isOnSale = !!product.salePrice;

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    if (product.numericProductId) {
      addItem(product.numericProductId, 1, product.salePrice ?? product.price).catch(() => {});
    }
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  }

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product?style_id=${product.productId}`} className="contents">

        {/* ── Image — 4:5 ratio ────────────────────────────── */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F3] mb-3">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Wishlist — circular white button, top-right */}
          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
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

          {/* Sale badge overlay */}
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-nordstrom-black text-white text-[10px] tracking-widest uppercase px-2 py-0.5 z-10">
              Sale
            </div>
          )}

          {/* Hover quick-add */}
          {hovered && (
            <div className="absolute bottom-0 inset-x-0 bg-white/97 px-3 py-2.5 border-t border-nordstrom-gray-200 z-20">
              <button
                onClick={handleAddToBag}
                className="w-full bg-nordstrom-black text-white text-[10px] tracking-widest uppercase py-2 hover:bg-nordstrom-gray-700 transition-colors"
              >
                {addedToBag ? "Added ✓" : "Add to Bag"}
              </button>
            </div>
          )}
        </div>

        {/* ── Color swatches — between image and text ─────── */}
        {product.colors && product.colors.length > 0 && (
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

          {/* Editorial headline as small uppercase kicker */}
          <p className="text-[10px] tracking-wide text-nordstrom-gray-500 uppercase line-clamp-1 mb-0.5">
            {product.editorialHeadline}
          </p>

          {/* Brand bold + product name inline — Nordstrom pattern */}
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

          {/* Attribution pill — "Fashion Office Pick", "Buyer's Choice", "Stylist Favorite" */}
          <span className={`self-start text-[10px] font-medium px-2 py-0.5 rounded-sm mt-0.5 ${ATTRIBUTION_BADGE[product.attribution]}`}>
            {ATTRIBUTION_LABELS[product.attribution]}
          </span>

          {/* Single-star rating + count */}
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
