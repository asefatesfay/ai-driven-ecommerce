"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface StickyAddToBagProps {
  productName: string;
  brand: string;
  imageUrl: string;
  price: number;
  salePrice?: number;
  selectedSize: string | null;
  onAddToBag: () => void;
  added: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function StickyAddToBag({
  productName,
  brand,
  imageUrl,
  price,
  salePrice,
  selectedSize,
  onAddToBag,
  added,
  triggerRef,
}: StickyAddToBagProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px", threshold: 0 }
    );
    if (triggerRef.current) observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [triggerRef]);

  if (!visible) return null;

  const displayPrice = salePrice ?? price;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-nordstrom-gray-200 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Thumbnail */}
        <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden bg-nordstrom-gray-50 hidden sm:block">
          <Image src={imageUrl} alt={productName} fill className="object-cover" sizes="48px" />
        </div>

        {/* Name + size */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-widest uppercase text-nordstrom-gray-500">{brand}</p>
          <p className="text-xs font-medium text-nordstrom-black truncate">{productName}</p>
          {selectedSize && (
            <p className="text-[11px] text-nordstrom-gray-500 mt-0.5">Size: {selectedSize}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col items-end flex-shrink-0">
          {salePrice ? (
            <>
              <span className="text-xs font-medium text-red-600">Sale: ${salePrice.toFixed(2)}</span>
              <span className="text-[10px] text-nordstrom-gray-500">After Sale: ${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-nordstrom-black">${displayPrice.toFixed(2)}</span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onAddToBag}
          className={`flex-shrink-0 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors ${
            added
              ? "bg-nordstrom-gray-700 text-white"
              : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
          }`}
        >
          {added ? "Added ✓" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
