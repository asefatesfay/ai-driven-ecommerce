"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, generateDrafts } from "@/lib/api";
import type { Product, Attribution, Theme, PriceRange } from "@/lib/types";
import { ATTRIBUTION_LABELS } from "@/lib/types";

const THEMES: Theme[] = ["cozy", "luxury", "practical", "outdoor", "wellness", "host-gift", "stocking-stuffer"];
const PRICE_RANGES: { label: string; value: PriceRange }[] = [
  { label: "Under $50", value: "under-50" },
  { label: "$50–$100", value: "50-100" },
  { label: "$100–$200", value: "100-200" },
  { label: "$200+", value: "200-plus" },
];

function priceRangeFromProduct(p: Product): PriceRange {
  const price = p.sale_price ?? p.price;
  if (price < 50) return "under-50";
  if (price <= 100) return "50-100";
  if (price <= 200) return "100-200";
  return "200-plus";
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [attribution, setAttribution] = useState<Attribution>("fashion-office");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>("50-100");
  const [maxWords, setMaxWords] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts({ search })
      .then((r) => setProducts(r.products ?? []))
      .catch((e) => console.error("fetchProducts failed:", e));
  }, [search]);

  function selectProduct(p: Product) {
    setSelected(p);
    setPriceRange(priceRangeFromProduct(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleGenerate() {
    if (!selected) return;
    setLoading(true);
    try {
      const result = await generateDrafts({
        style_id: selected.style_id,
        attribution,
        themes,
        price_range: priceRange,
        max_words: maxWords,
        num_variants: 1,
      });
      if (result.drafts?.length) {
        router.push(`/drafts/${result.drafts[0].id}`);
      }
    } catch (err) {
      alert(`Generation failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-8">
      {/* Config panel */}
      <div className="w-80 shrink-0 space-y-6">
        <div>
          <h1 className="text-xl font-semibold mb-1">Generate Editorial Copy</h1>
          <p className="text-sm text-gray-500">Pick a product then configure the voice.</p>
        </div>

        {selected ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
            <p className="text-xs text-gray-400">{selected.style_id}</p>
            <p className="font-medium text-sm">{selected.brand} — {selected.name}</p>
            <p className="text-xs text-gray-500">${selected.price.toFixed(2)} · ★ {selected.rating} ({selected.review_count.toLocaleString()})</p>
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Change</button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Select a product from the right →
          </div>
        )}

        {/* Attribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attribution voice</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ATTRIBUTION_LABELS) as Attribution[]).map((a) => (
              <button
                key={a}
                onClick={() => setAttribution(a)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors text-left ${
                  attribution === a ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {ATTRIBUTION_LABELS[a]}
              </button>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Themes</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setThemes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
                  themes.includes(t) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price range</label>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_RANGES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriceRange(p.value)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  priceRange === p.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max words */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max words</label>
          <input
            type="number"
            min={20}
            max={120}
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selected || loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating…" : "Generate Copy"}
        </button>
      </div>

      {/* Product list */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="space-y-2">
          {products.map((p) => (
            <button
              key={p.style_id}
              onClick={() => selectProduct(p)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                selected?.style_id === p.style_id
                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{p.style_id} · {p.category}</p>
                <p className="font-medium text-sm truncate">{p.brand} — {p.name}</p>
                <p className="text-xs text-gray-500">
                  ${(p.sale_price ?? p.price).toFixed(2)}
                  {p.sale_price && <span className="line-through text-gray-300 ml-1">${p.price.toFixed(2)}</span>}
                  <span className="mx-1">·</span>★ {p.rating} ({p.review_count.toLocaleString()})
                </p>
              </div>
            </button>
          ))}
          {products.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}
