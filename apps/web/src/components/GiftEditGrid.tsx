"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchEditorial, apiEditorialToUI } from "@/lib/api";
import type { FilterRecipient, FilterTheme, FilterPrice, EditorialProduct } from "@/lib/data";
import type { ActiveFilters } from "./FilterBar";
import FilterBar from "./FilterBar";
import EditorialProductCard from "./EditorialProductCard";

export default function GiftEditGrid() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search")?.toLowerCase() ?? "";
  const [products, setProducts] = useState<EditorialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilters>({
    recipient: null,
    theme: null,
    price: null,
  });

  // Fetch all editorial products once on mount; filter client-side
  useEffect(() => {
    fetchEditorial({})
      .then((data) => setProducts((data.editorial_products ?? []).map(apiEditorialToUI)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleFilterChange(key: keyof ActiveFilters, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (filters.recipient && !p.filters.recipient.includes(filters.recipient as FilterRecipient)) return false;
      if (filters.theme && !p.filters.theme.includes(filters.theme as FilterTheme)) return false;
      if (filters.price && p.filters.price !== (filters.price as FilterPrice)) return false;
      if (urlSearch && !p.name.toLowerCase().includes(urlSearch) && !p.brand.toLowerCase().includes(urlSearch)) return false;
      return true;
    });
  }, [products, filters, urlSearch]);

  return (
    <>
      <FilterBar filters={filters} onFilterChange={handleFilterChange} resultCount={filtered.length} />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-nordstrom-gray-100 mb-4" />
                <div className="h-3 bg-nordstrom-gray-100 w-1/3 mb-2" />
                <div className="h-4 bg-nordstrom-gray-100 w-2/3 mb-2" />
                <div className="h-3 bg-nordstrom-gray-100 w-full mb-1" />
                <div className="h-3 bg-nordstrom-gray-100 w-5/6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-nordstrom-gray-500 text-sm tracking-wide mb-4">
              No items match your current filters.
            </p>
            <button
              onClick={() => setFilters({ recipient: null, theme: null, price: null })}
              className="text-xs tracking-widest uppercase underline text-nordstrom-black"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((product) => (
              <EditorialProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-16 pt-8 border-t border-nordstrom-gray-200 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-2">
              About This Edit
            </p>
            <p className="text-sm text-nordstrom-gray-700 max-w-md mx-auto leading-relaxed font-light">
              Every item here was personally selected by our Fashion Office, Buyers, and Stylists —
              and every recommendation comes with a reason. No filler, no guesswork.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
