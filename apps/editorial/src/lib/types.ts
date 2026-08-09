export type Attribution = "fashion-office" | "buyer" | "stylist" | "customer-loved";
export type DraftStatus = "draft" | "approved" | "published" | "archived";
export type Theme = "cozy" | "luxury" | "practical" | "outdoor" | "wellness" | "host-gift" | "stocking-stuffer";
export type PriceRange = "under-50" | "50-100" | "100-200" | "200-plus";

export interface Draft {
  id: number;
  style_id: string;
  product_name: string;
  brand: string;
  attribution: Attribution;
  headline: string;
  body: string;
  tone_notes?: string;
  status: DraftStatus;
  themes: Theme[];
  price_range: PriceRange;
  generated_by: "ai" | "human";
  reviewed_by?: string;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DraftListResult {
  drafts: Draft[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Product {
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
  recipients: string[];
  colors: { name: string; hex: string }[];
}

export interface GenerateRequest {
  style_id: string;
  attribution: Attribution;
  themes: Theme[];
  price_range: PriceRange;
  max_words: number;
  num_variants: number;
  feedback?: string;
  previous_headline?: string;
  previous_body?: string;
}

export const ATTRIBUTION_LABELS: Record<Attribution, string> = {
  "fashion-office": "Fashion Office",
  "buyer": "Buyer",
  "stylist": "Stylist",
  "customer-loved": "Customer Loved",
};

export const STATUS_COLORS: Record<DraftStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-500",
};
