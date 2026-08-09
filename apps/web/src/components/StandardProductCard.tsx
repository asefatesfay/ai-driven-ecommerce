"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CatalogProduct } from "@/lib/catalog-data";
import StarRating from "./StarRating";
import ProductBadge from "./ProductBadge";
import ColorSwatches from "./ColorSwatches";
import SizeSelector from "./SizeSelector";

export default function StandardProductCard({ product }: { product: CatalogProduct }) {
  const [wished, setWished] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const isOnSale = !!product.salePrice;
  const displayPrice = product.salePrice ?? product.price;

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    if (product.sizes.length > 0 && !selectedSize) return;
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  }

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
    <Link href={`/product?style_id=${product.id}`} className="contents">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-nordstrom-gray-50 mb-3">
        <Image
          src={product.imageUrl}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Wishlist — always visible (#4 fix) */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => { e.preventDefault(); setWished(!wished); }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={wished ? "#000" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Badge — above product name on the image */}
        {product.badge && (
          <div className="absolute top-2 left-2">
            <ProductBadge badge={product.badge} badgeType={product.badgeType} />
          </div>
        )}

        {/* Hover: size selector or quick-add (#3 fix) */}
        {hovered && (
          <div className="absolute bottom-0 inset-x-0 bg-white/97 px-3 py-2.5 border-t border-nordstrom-gray-200">
            {product.sizes.length > 0 ? (
              <>
                <p className="text-[9px] tracking-widest uppercase text-nordstrom-gray-500 mb-1.5">
                  {selectedSize ? `Size: ${selectedSize}` : "Select a size"}
                </p>
                <SizeSelector
                  sizes={product.sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
                {selectedSize && (
                  <button
                    onClick={handleAddToBag}
                    className="mt-2 w-full bg-nordstrom-black text-white text-[10px] tracking-widest uppercase py-2 hover:bg-nordstrom-gray-700 transition-colors"
                  >
                    {addedToBag ? "Added ✓" : "Add to Bag"}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleAddToBag}
                className="w-full bg-nordstrom-black text-white text-[10px] tracking-widest uppercase py-2 hover:bg-nordstrom-gray-700 transition-colors"
              >
                {addedToBag ? "Added ✓" : "Add to Bag"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] tracking-widest uppercase text-nordstrom-gray-500">{product.brand}</p>
        <p className="text-xs text-nordstrom-black leading-snug line-clamp-2">{product.name}</p>

        {/* Color swatches (#1 fix) */}
        <ColorSwatches
          colors={product.colors}
          selected={selectedColor}
          onSelect={setSelectedColor}
        />

        {/* Rating — gold stars (#8 fix) */}
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Nordstrom-style stacked pricing (#2 fix) */}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {isOnSale ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-red-600">Sale: ${displayPrice.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-nordstrom-gray-500">
                After Sale: ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-nordstrom-black">${displayPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
    </article>
  );
}
