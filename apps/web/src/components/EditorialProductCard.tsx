"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditorialProduct } from "@/lib/data";
import { ATTRIBUTION_LABELS, FILTER_LABELS } from "@/lib/data";

interface EditorialProductCardProps {
  product: EditorialProduct;
}

export default function EditorialProductCard({ product }: EditorialProductCardProps) {
  const [wished, setWished] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const displayPrice = product.salePrice ?? product.price;
  const isOnSale = !!product.salePrice;

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  }

  const allFilterTags = [
    ...product.filters.recipient.map((r) => FILTER_LABELS.recipient[r]),
    ...product.filters.theme.map((t) => FILTER_LABELS.theme[t]),
    FILTER_LABELS.price[product.filters.price],
  ].slice(0, 4);

  return (
    <article className="group flex flex-col bg-white border border-nordstrom-gray-200 hover:border-nordstrom-gray-300 transition-all duration-200 hover:shadow-sm">
      <Link href="/product" className="contents">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-nordstrom-gray-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Wishlist button */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => { e.preventDefault(); setWished(!wished); }}
          className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wished ? "#000" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Attribution badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/95 text-nordstrom-black text-[10px] tracking-widest uppercase px-2.5 py-1 font-medium">
            {ATTRIBUTION_LABELS[product.attribution]}
          </span>
        </div>

        {/* Sale badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-nordstrom-black text-white text-[10px] tracking-widest uppercase px-2.5 py-1">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* Editorial content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Brand */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-1.5">
          {product.brand}
        </p>

        {/* Editorial headline */}
        <h2 className="text-base font-medium text-nordstrom-black leading-snug mb-2 line-clamp-2">
          {product.editorialHeadline}
        </h2>

        {/* Product name */}
        <p className="text-xs text-nordstrom-gray-500 mb-3 line-clamp-1">
          {product.name}
        </p>

        {/* Divider */}
        <div className="w-8 h-px bg-nordstrom-gray-200 mb-3" />

        {/* Editorial copy */}
        <p className="text-sm text-nordstrom-gray-700 leading-relaxed line-clamp-3 flex-1 mb-4">
          {product.editorialCopy}
        </p>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allFilterTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-wide uppercase text-nordstrom-gray-500 border border-nordstrom-gray-200 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-sm font-medium ${
                isOnSale ? "text-red-600" : "text-nordstrom-black"
              }`}
            >
              ${displayPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-xs text-nordstrom-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToBag}
            className={`
              text-xs tracking-widest uppercase font-medium px-4 py-2 transition-all duration-150
              ${
                addedToBag
                  ? "bg-nordstrom-gray-700 text-white"
                  : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
              }
            `}
          >
            {addedToBag ? "Added" : "Add to Bag"}
          </button>
        </div>
      </div>
      </Link>
    </article>
  );
}
