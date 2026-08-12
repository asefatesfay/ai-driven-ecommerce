const CATALOG_BASE = process.env.NEXT_PUBLIC_CATALOG_URL ?? "http://localhost:8081";
const INVENTORY_BASE = process.env.NEXT_PUBLIC_INVENTORY_URL ?? "http://localhost:8082";

export interface APIProduct {
  id: number;
  style_id: string;
  brand: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sale_price?: number;
  rating: number;
  review_count: number;
  image_url: string;
  badge?: string;
  badge_type?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  recipients: string[];
  active: boolean;
}

export interface APIEditorialProduct {
  id: number;
  product_id: number;
  editorial_headline: string;
  editorial_copy: string;
  attribution: string;
  filter_recipient: string[];
  filter_theme: string[];
  filter_price: string;
  sort_order: number;
  active: boolean;
  product: APIProduct;
}

export interface APIProductListResult {
  products: APIProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface APIInventoryEntry {
  id: number;
  product_id: number;
  style_id: string;
  size: string;
  color_name: string;
  quantity: number;
  reserved_qty: number;
  available_qty: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface APIProductInventory {
  product_id: number;
  style_id: string;
  variants: APIInventoryEntry[];
  in_stock: boolean;
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export async function fetchProducts(params: {
  category?: string;
  recipient?: string;
  on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}): Promise<APIProductListResult> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const res = await fetch(`${CATALOG_BASE}/api/v1/products?${q}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`fetchProducts: ${res.status}`);
  return res.json();
}

export async function fetchProduct(styleId: string | number): Promise<APIProduct> {
  const url = typeof styleId === "string" && isNaN(Number(styleId))
    ? `${CATALOG_BASE}/api/v1/products/style/${styleId}`
    : `${CATALOG_BASE}/api/v1/products/style/${styleId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`fetchProduct: ${res.status}`);
  return res.json();
}

export async function fetchEditorial(params: {
  recipient?: string;
  theme?: string;
  price?: string;
}): Promise<{ editorial_products: APIEditorialProduct[]; total: number }> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const res = await fetch(`${CATALOG_BASE}/api/v1/editorial?${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchEditorial: ${res.status}`);
  return res.json();
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function fetchInventory(productId: number): Promise<APIProductInventory> {
  const res = await fetch(`${INVENTORY_BASE}/api/v1/inventory/${productId}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`fetchInventory: ${res.status}`);
  return res.json();
}

export async function fetchBulkInventory(styleIds: string[]): Promise<Record<string, APIProductInventory>> {
  if (styleIds.length === 0) return {};
  const res = await fetch(
    `${INVENTORY_BASE}/api/v1/inventory?style_ids=${styleIds.join(",")}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`fetchBulkInventory: ${res.status}`);
  return res.json();
}

// ── Type adapters: API → UI models ───────────────────────────────────────────
// These convert the snake_case API shapes into the camelCase shapes
// the existing UI components already expect.

import type { CatalogProduct } from "./catalog-data";
import type { EditorialProduct } from "./data";

export function apiProductToCatalog(p: APIProduct): CatalogProduct {
  return {
    id: p.style_id,
    productId: p.id,
    brand: p.brand,
    name: p.name,
    price: p.price,
    salePrice: p.sale_price,
    rating: p.rating,
    reviewCount: p.review_count,
    imageUrl: p.image_url,
    badge: p.badge,
    badgeType: p.badge_type as CatalogProduct["badgeType"],
    colors: p.colors,
    sizes: p.sizes,
    recipient: p.recipients as CatalogProduct["recipient"],
    priceRange: priceRangeFor(p.sale_price ?? p.price),
    category: p.category as CatalogProduct["category"],
    occasion: [],
  };
}

export function apiEditorialToUI(ep: APIEditorialProduct): EditorialProduct {
  const p = ep.product;
  return {
    id: `api-editorial-${ep.id}`,
    productId: String(p.style_id),
    numericProductId: p.id,
    brand: p.brand,
    name: p.name,
    price: p.price,
    salePrice: p.sale_price,
    rating: p.rating,
    reviewCount: p.review_count,
    imageUrl: p.image_url,
    editorialHeadline: ep.editorial_headline,
    editorialCopy: ep.editorial_copy,
    attribution: ep.attribution as EditorialProduct["attribution"],
    colors: p.colors ?? [],
    filters: {
      recipient: ep.filter_recipient as EditorialProduct["filters"]["recipient"],
      theme: ep.filter_theme as EditorialProduct["filters"]["theme"],
      price: ep.filter_price as EditorialProduct["filters"]["price"],
    },
    active: ep.active,
  };
}

function priceRangeFor(price: number): CatalogProduct["priceRange"] {
  if (price < 25) return "under-25";
  if (price < 50) return "under-50";
  if (price < 100) return "under-100";
  return "luxe";
}
