"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { MOONLIGHT_PAJAMAS, type ProductDetail } from "@/lib/product-data";
import { fetchProduct, fetchInventory, type APIProductInventory } from "@/lib/api";
import { useCart } from "@/lib/CartContext";

function deterministicViewers(styleId: string): number {
  return (styleId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 400) + 50;
}

function buildSizesWithInventory(
  sizes: string[],
  inventory: APIProductInventory | null
): { label: string; soldOut?: boolean }[] {
  if (!inventory?.variants) return sizes.map((s) => ({ label: s }));

  return sizes.map((s) => {
    const variants = inventory.variants.filter((v) => v.size === s);
    const totalAvailable = variants.reduce((sum, v) => sum + v.available_qty, 0);
    return { label: s, soldOut: variants.length > 0 && totalAvailable === 0 };
  });
}

function getLowStockMessage(
  selectedSize: string | null,
  inventory: APIProductInventory | null
): string | null {
  if (!selectedSize || !inventory?.variants) return null;
  const variants = inventory.variants.filter((v) => v.size === selectedSize);
  const total = variants.reduce((sum, v) => sum + v.available_qty, 0);
  if (total > 0 && total <= 3) return `Only ${total} left in this size`;
  return null;
}

function apiToProductDetail(
  p: Awaited<ReturnType<typeof fetchProduct>>,
  inventory: APIProductInventory | null,
  editorial?: { headline: string; copy: string; attribution: string }
): ProductDetail {
  return {
    id: p.style_id,
    brand: p.brand,
    name: p.name,
    badge: p.badge,
    badgeType: p.badge_type as ProductDetail["badgeType"],
    price: p.price,
    salePrice: p.sale_price,
    rating: p.rating,
    reviewCount: p.review_count,
    viewersNow: deterministicViewers(p.style_id),
    images: [p.image_url],
    colors: p.colors.map((c) => ({ name: c.name, swatch: c.hex, imageUrl: p.image_url })),
    sizes: buildSizesWithInventory(p.sizes, inventory),
    fitNote: "",
    description: p.description,
    editorialHeadline: editorial?.headline,
    editorialCopy: editorial?.copy,
    attribution: editorial?.attribution,
    shippingNote: "Free shipping & returns",
    details: [
      { label: "Details", items: [p.description] },
      { label: "Brand", items: [p.brand] },
    ],
    reviews: [],
    ratingBreakdown: { 5: 60, 4: 20, 3: 10, 2: 5, 1: 5 },
  };
}

export default function ProductPageClient() {
  const searchParams = useSearchParams();
  const styleId = searchParams.get("style_id") ?? searchParams.get("id");
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail>(MOONLIGHT_PAJAMAS);
  const [rawProductId, setRawProductId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<APIProductInventory | null>(null);
  const [loading, setLoading] = useState(!!styleId);
  const [notFound, setNotFound] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!styleId) return;
    setLoading(true);
    setNotFound(false);
    setSelectedColor(0);
    setSelectedSize(null);
    setInventory(null);

    fetchProduct(styleId)
      .then(async (p) => {
        setRawProductId(p.id);

        const [inv, editorialData] = await Promise.allSettled([
          fetchInventory(p.id),
          fetch(`${process.env.NEXT_PUBLIC_CATALOG_URL ?? "http://localhost:8081"}/api/v1/editorial`)
            .then((r) => r.json()),
        ]);

        const resolvedInv = inv.status === "fulfilled" ? inv.value : null;
        setInventory(resolvedInv);

        let editorial;
        if (editorialData.status === "fulfilled") {
          const match = (editorialData.value.editorial_products ?? []).find(
            (ep: { product: { style_id: string }; editorial_headline: string; editorial_copy: string; attribution: string }) =>
              ep.product?.style_id === p.style_id
          );
          if (match) {
            editorial = { headline: match.editorial_headline, copy: match.editorial_copy, attribution: match.attribution };
          }
        }

        setProduct(apiToProductDetail(p, resolvedInv, editorial));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [styleId]);

  function handleAddToBag() {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSizeError(false);
    if (rawProductId) addItem(rawProductId, 1, product.salePrice ?? product.price).catch(() => {});
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const activeImages = product.colors.length > 0
    ? [product.colors[selectedColor]?.imageUrl ?? product.images[0], ...product.images.filter((img) => img !== product.colors[selectedColor]?.imageUrl)]
    : product.images;

  const lowStockMsg = getLowStockMessage(selectedSize, inventory);
  const BREADCRUMB = ["Home", "Gifts", product.brand, product.name];

  if (notFound) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-lg font-light text-nordstrom-gray-700">Product not found</p>
          <Link href="/gifts" className="text-xs tracking-widest uppercase underline text-nordstrom-black hover:text-nordstrom-gray-700">
            Back to Gifts
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {loading ? (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex gap-1.5">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      ) : (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-1.5 mb-6 flex-wrap">
            {BREADCRUMB.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-nordstrom-gray-300 text-[10px]">/</span>}
                <span className={`text-[11px] tracking-wide ${i === BREADCRUMB.length - 1 ? "text-nordstrom-gray-500" : "text-nordstrom-gray-700"}`}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
            <div className="relative">
              <ImageGallery images={activeImages} productName={product.name} />
            </div>

            <div className="flex flex-col gap-5">
              <div>
                {product.badge && product.badgeType && (
                  <div className="mb-2"><ProductBadge badge={product.badge} badgeType={product.badgeType} /></div>
                )}
                <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-1">{product.brand}</p>
                <h1 className="text-xl sm:text-2xl font-light tracking-tight text-nordstrom-black leading-snug">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a href="#reviews" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                </a>
                <span className="text-nordstrom-gray-200 text-xs">|</span>
                <span className="text-[11px] text-nordstrom-gray-500">{product.viewersNow.toLocaleString()} people viewing now</span>
              </div>

              <div>
                {product.salePrice ? (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-red-600">Sale: ${product.salePrice.toFixed(2)}</p>
                    <p className="text-xs text-nordstrom-gray-500">After Sale: ${product.price.toFixed(2)}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-nordstrom-black">${product.price.toFixed(2)}</p>
                )}
              </div>

              <p className="text-sm text-nordstrom-gray-700 leading-relaxed">{product.description}</p>

              {product.editorialHeadline && (
                <div className="bg-nordstrom-cream border-l-2 border-nordstrom-black px-4 py-3">
                  <p className="text-[10px] tracking-widest uppercase text-nordstrom-gray-500 mb-1">{product.attribution} Pick</p>
                  <p className="text-sm font-medium text-nordstrom-black mb-1">{product.editorialHeadline}</p>
                  <p className="text-xs text-nordstrom-gray-700 leading-relaxed">{product.editorialCopy}</p>
                </div>
              )}

              {product.colors.length > 0 && (
                <ColorSelector colors={product.colors} selected={selectedColor} onSelect={setSelectedColor} />
              )}

              {product.sizes.length > 0 && (
                <div id="size-picker">
                  <SizePicker
                    sizes={product.sizes}
                    selected={selectedSize}
                    onSelect={(s) => { setSelectedSize(s); setSizeError(false); }}
                    fitNote={product.fitNote}
                    error={sizeError}
                  />
                  {lowStockMsg && <p className="text-xs text-red-600 mt-2">{lowStockMsg}</p>}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  ref={addButtonRef}
                  onClick={handleAddToBag}
                  className={`flex-1 py-3.5 text-xs tracking-widest uppercase font-medium transition-colors ${
                    added ? "bg-nordstrom-gray-700 text-white" : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
                  }`}
                >
                  {added ? "Added to Bag ✓" : "Add to Bag"}
                </button>
                <button
                  onClick={() => setWished(!wished)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  className="border border-nordstrom-gray-300 px-4 hover:border-nordstrom-black transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "#000" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <FulfillmentOptions shippingNote={product.shippingNote} />
              <DetailsAccordion sections={product.details} />
            </div>
          </div>

          <div id="reviews">
            <ReviewsSection
              rating={product.rating}
              reviewCount={product.reviewCount}
              breakdown={product.ratingBreakdown}
              reviews={product.reviews}
            />
          </div>
        </div>
      )}

      <SiteFooter />

      <StickyAddToBag
        productName={product.name}
        brand={product.brand}
        imageUrl={product.colors[selectedColor]?.imageUrl ?? product.images[0]}
        price={product.price}
        salePrice={product.salePrice}
        selectedSize={selectedSize}
        onAddToBag={handleAddToBag}
        added={added}
        triggerRef={addButtonRef}
      />
    </div>
  );
}
