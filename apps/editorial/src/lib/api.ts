import type { Draft, DraftListResult, GenerateRequest, Product } from "./types";

const EDITORIAL_URL = process.env.NEXT_PUBLIC_EDITORIAL_URL ?? "http://localhost:8089";
const CATALOG_URL = process.env.NEXT_PUBLIC_CATALOG_URL ?? "http://localhost:8081";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Catalog ───────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: { search?: string; page?: number }): Promise<{ products: Product[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  q.set("page_size", "48");
  return apiFetch(`${CATALOG_URL}/api/v1/products?${q}`);
}

export async function fetchProduct(styleId: string): Promise<Product> {
  return apiFetch(`${CATALOG_URL}/api/v1/products/style/${styleId}`);
}

// ── Editorial drafts ──────────────────────────────────────────────────────────

export async function listDrafts(params?: {
  status?: string;
  style_id?: string;
  page?: number;
}): Promise<DraftListResult> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.style_id) q.set("style_id", params.style_id);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts?${q}`);
}

export async function getDraft(id: number): Promise<Draft> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/${id}`);
}

export async function generateDrafts(req: GenerateRequest): Promise<{ drafts: Draft[]; style_id: string; total: number }> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/generate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateDraft(id: number, headline: string, body: string): Promise<Draft> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ headline, body }),
  });
}

export async function approveDraft(id: number, reviewedBy: string): Promise<Draft> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ reviewed_by: reviewedBy }),
  });
}

export async function publishDraft(id: number, publishedBy: string): Promise<Draft> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ published_by: publishedBy }),
  });
}

export async function archiveDraft(id: number): Promise<void> {
  return apiFetch(`${EDITORIAL_URL}/api/v1/drafts/${id}/archive`, { method: "POST" });
}
