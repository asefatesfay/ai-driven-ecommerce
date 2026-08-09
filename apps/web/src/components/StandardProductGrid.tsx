"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProducts, apiProductToCatalog } from "@/lib/api";
import type { CatalogProduct } from "@/lib/catalog-data";
import StandardProductCard from "./StandardProductCard";
import FilterAccordion from "./FilterAccordion";
import ActiveFilterPills from "./ActiveFilterPills";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Customer Rating" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const FILTER_GROUPS = [
  {
    key: "gender",
    label: "Shop For",
    options: [
      { value: "her", label: "Women" },
      { value: "him", label: "Men" },
      { value: "teens", label: "Teens" },
      { value: "kids", label: "Kids" },
    ],
  },
  {
    key: "category",
    label: "Category",
    options: [
      { value: "beauty", label: "Beauty & Grooming" },
      { value: "apparel", label: "Clothing" },
      { value: "home", label: "Home" },
      { value: "shoes", label: "Shoes" },
      { value: "accessories", label: "Accessories" },
      { value: "wellness", label: "Wellness" },
      { value: "toys", label: "Toys" },
    ],
  },
  {
    key: "priceRange",
    label: "Price",
    options: [
      { value: "on_sale", label: "On Sale" },
      { value: "under-50", label: "Under $50" },
      { value: "under-100", label: "Under $100" },
      { value: "luxe", label: "Luxe ($200+)" },
    ],
  },
];

const LABEL_MAP: Record<string, Record<string, string>> = Object.fromEntries(
  FILTER_GROUPS.map((g) => [g.key, Object.fromEntries(g.options.map((o) => [o.value, o.label]))])
);

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  const delta = 2;
  const range: number[] = [];
  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) range.push(i);
  pages.push(1);
  if (range[0] > 2) pages.push("…");
  pages.push(...range);
  if (range[range.length - 1] < totalPages - 1) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page"
        className="w-9 h-9 flex items-center justify-center border border-transparent text-nordstrom-gray-500 hover:border-nordstrom-gray-300 hover:text-nordstrom-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-nordstrom-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)} aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 flex items-center justify-center text-xs transition-colors border ${p === page ? "border-nordstrom-black bg-nordstrom-black text-white" : "border-transparent text-nordstrom-gray-700 hover:border-nordstrom-gray-300 hover:text-nordstrom-black"}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page"
        className="w-9 h-9 flex items-center justify-center border border-transparent text-nordstrom-gray-500 hover:border-nordstrom-gray-300 hover:text-nordstrom-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

export default function StandardProductGrid() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [sort, setSort] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({ gender: null, category: null, priceRange: null });
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = { page, page_size: PAGE_SIZE };

    if (activeFilters.gender) params.recipient = activeFilters.gender;
    if (activeFilters.category) params.category = activeFilters.category;
    if (activeFilters.priceRange === "on_sale") params.on_sale = true;
    if (activeFilters.priceRange === "under-50") params.max_price = 50;
    if (activeFilters.priceRange === "under-100") params.max_price = 100;
    if (activeFilters.priceRange === "luxe") params.min_price = 200;
    if (sort !== "featured") params.sort = sort;

    if (urlSearch) params.search = urlSearch;

    fetchProducts(params as Parameters<typeof fetchProducts>[0])
      .then((data) => {
        setProducts((data.products ?? []).map(apiProductToCatalog));
        setTotal(data.total);
        setTotalPages(data.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sort, activeFilters, urlSearch]);

  function toggleFilter(key: string, value: string) {
    setActiveFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
    setPage(1);
  }
  function removeFilter(key: string) { setActiveFilters((prev) => ({ ...prev, [key]: null })); setPage(1); }
  function clearAll() { setActiveFilters({ gender: null, category: null, priceRange: null }); setPage(1); }

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <section ref={sectionRef} className="border-t border-nordstrom-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button className="sm:hidden flex items-center gap-1.5 text-xs tracking-wide border border-nordstrom-gray-300 px-3 py-2 hover:border-nordstrom-black transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="18" x2="13" y2="18" />
              </svg>
              Filter
            </button>
            <div>
              <span className="text-sm font-light text-nordstrom-black">All Gifts</span>
              {!loading && total > 0 && (
                <span className="text-xs text-nordstrom-gray-500 ml-2">
                  {startItem}–{endItem} of {total.toLocaleString()} items
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-nordstrom-gray-500 hidden sm:block whitespace-nowrap">Sort by:</label>
            <select id="sort-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="text-xs border border-nordstrom-gray-300 px-3 py-2 bg-white focus:outline-none hover:border-nordstrom-black transition-colors cursor-pointer">
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`flex-shrink-0 w-44 ${sidebarOpen ? "block" : "hidden"} sm:block`}>
            {FILTER_GROUPS.map((group) => (
              <FilterAccordion key={group.key} title={group.label} filterKey={group.key}
                options={group.options} activeValue={activeFilters[group.key]} onToggle={toggleFilter} />
            ))}
          </aside>

          <div className="flex-1 min-w-0">
            <ActiveFilterPills activeFilters={activeFilters} labelMap={LABEL_MAP} onRemove={removeFilter} onClearAll={clearAll} />

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-nordstrom-gray-100 mb-3" />
                    <div className="h-2.5 bg-nordstrom-gray-100 w-1/3 mb-1.5" />
                    <div className="h-3 bg-nordstrom-gray-100 w-3/4 mb-2" />
                    <div className="h-2.5 bg-nordstrom-gray-100 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-nordstrom-gray-500 text-sm mb-3">No items match your filters.</p>
                <button onClick={clearAll} className="text-xs underline text-nordstrom-black">Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {products.map((product) => <StandardProductCard key={product.id} product={product} />)}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => {
                  setPage(p);
                  sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
