"use client";

import { useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StarRating from "@/components/StarRating";
import ProductBadge from "@/components/ProductBadge";
import ImageGallery from "@/components/pdp/ImageGallery";
import ColorSelector from "@/components/pdp/ColorSelector";
import SizePicker from "@/components/pdp/SizePicker";
import FulfillmentOptions from "@/components/pdp/FulfillmentOptions";
import DetailsAccordion from "@/components/pdp/DetailsAccordion";
import ReviewsSection from "@/components/pdp/ReviewsSection";
import StickyAddToBag from "@/components/pdp/StickyAddToBag";
import { MOONLIGHT_PAJAMAS } from "@/lib/product-data";

const p = MOONLIGHT_PAJAMAS;

const BREADCRUMB = ["Home", "Gifts", "Gifts by Recipient", "For Her"];

export default function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Swap gallery images when color changes
  const activeImages = [
    p.colors[selectedColor].imageUrl,
    ...p.images.filter((img) => img !== p.colors[selectedColor].imageUrl),
  ];

  function handleAddToBag() {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSizeError(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-6">
          {BREADCRUMB.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-nordstrom-gray-300 text-[10px]">/</span>}
              <a
                href="#"
                className={`text-[11px] tracking-wide transition-colors ${
                  i === BREADCRUMB.length - 1
                    ? "text-nordstrom-gray-500 pointer-events-none"
                    : "text-nordstrom-gray-700 hover:text-nordstrom-black"
                }`}
              >
                {crumb}
              </a>
            </span>
          ))}
        </nav>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: image gallery */}
          <div className="relative">
            <ImageGallery images={activeImages} productName={p.name} />
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-5">
            {/* Badge + brand + title */}
            <div>
              {p.badge && p.badgeType && (
                <div className="mb-2">
                  <ProductBadge badge={p.badge} badgeType={p.badgeType} />
                </div>
              )}
              <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-1">{p.brand}</p>
              <h1 className="text-xl sm:text-2xl font-light tracking-tight text-nordstrom-black leading-snug">
                {p.name}
              </h1>
            </div>

            {/* Rating + viewers */}
            <div className="flex items-center gap-3 flex-wrap">
              <a href="#reviews" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <StarRating rating={p.rating} reviewCount={p.reviewCount} />
              </a>
              <span className="text-nordstrom-gray-200 text-xs">|</span>
              <span className="text-[11px] text-nordstrom-gray-500">
                {p.viewersNow.toLocaleString()} people viewing now
              </span>
            </div>

            {/* Price */}
            <div>
              {p.salePrice ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-red-600">
                    Sale: ${p.salePrice.toFixed(2)}{p.salePriceMax ? ` – $${p.salePriceMax.toFixed(2)}` : ""}
                  </p>
                  <p className="text-xs text-nordstrom-gray-500">
                    After Sale: ${p.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-nordstrom-black">${p.price.toFixed(2)}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-nordstrom-gray-700 leading-relaxed">{p.description}</p>

            {/* Editorial callout */}
            {p.editorialHeadline && (
              <div className="bg-nordstrom-cream border-l-2 border-nordstrom-black px-4 py-3">
                <p className="text-[10px] tracking-widest uppercase text-nordstrom-gray-500 mb-1">
                  {p.attribution} Pick
                </p>
                <p className="text-sm font-medium text-nordstrom-black mb-1">{p.editorialHeadline}</p>
                <p className="text-xs text-nordstrom-gray-700 leading-relaxed">{p.editorialCopy}</p>
              </div>
            )}

            {/* Color selector */}
            <ColorSelector
              colors={p.colors}
              selected={selectedColor}
              onSelect={(i) => { setSelectedColor(i); }}
            />

            {/* Size picker */}
            <div id="size-picker">
              <SizePicker
                sizes={p.sizes}
                selected={selectedSize}
                onSelect={(s) => { setSelectedSize(s); setSizeError(false); }}
                fitNote={p.fitNote}
                error={sizeError}
              />
            </div>

            {/* Add to Bag + Wishlist */}
            <div className="flex gap-3">
              <button
                ref={addButtonRef}
                onClick={handleAddToBag}
                className={`flex-1 py-3.5 text-xs tracking-widest uppercase font-medium transition-colors ${
                  added
                    ? "bg-nordstrom-gray-700 text-white"
                    : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
                }`}
              >
                {added ? "Added to Bag ✓" : "Add to Bag"}
              </button>
              <button
                onClick={() => setWished(!wished)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="border border-nordstrom-gray-300 px-4 hover:border-nordstrom-black transition-colors"
              >
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill={wished ? "#000" : "none"} stroke="currentColor" strokeWidth="1.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Promo card nudge */}
            <div className="flex items-center gap-2 bg-nordstrom-gray-50 px-4 py-3 border border-nordstrom-gray-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A951" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <p className="text-[11px] text-nordstrom-gray-700">
                <span className="font-medium">Get $60 off</span> your next purchase with a new Nordstrom card.
                <a href="#" className="underline ml-1 hover:text-nordstrom-black">Learn more</a>
              </p>
            </div>

            {/* Fulfillment options */}
            <FulfillmentOptions shippingNote={p.shippingNote} />

            {/* Details accordions */}
            <DetailsAccordion sections={p.details} />
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews">
          <ReviewsSection
            rating={p.rating}
            reviewCount={p.reviewCount}
            breakdown={p.ratingBreakdown}
            reviews={p.reviews}
          />
        </div>
      </div>

      <SiteFooter />

      {/* Sticky add-to-bag */}
      <StickyAddToBag
        productName={p.name}
        brand={p.brand}
        imageUrl={p.colors[selectedColor].imageUrl}
        price={p.price}
        salePrice={p.salePrice}
        selectedSize={selectedSize}
        onAddToBag={handleAddToBag}
        added={added}
        triggerRef={addButtonRef}
      />
    </div>
  );
}
