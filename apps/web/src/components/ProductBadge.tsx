import type { CatalogProduct } from "@/lib/catalog-data";

const BADGE_STYLES: Record<NonNullable<CatalogProduct["badgeType"]>, string> = {
  "sale": "bg-red-600 text-white",
  "new-markdown": "bg-red-600 text-white",
  "anniversary-sale": "bg-nordstrom-gold text-white",
  "best-seller": "bg-nordstrom-black text-white",
  "top-rated": "bg-nordstrom-black text-white",
  "beauty-exclusive": "bg-[#6B3A5E] text-white",
  "gift-with-purchase": "bg-[#2D6A4F] text-white",
};

export default function ProductBadge({
  badge,
  badgeType,
}: {
  badge: string;
  badgeType?: CatalogProduct["badgeType"];
}) {
  const style = badgeType ? BADGE_STYLES[badgeType] : "bg-nordstrom-black text-white";
  return (
    <span className={`inline-block text-[9px] tracking-widest uppercase font-medium px-2 py-0.5 ${style}`}>
      {badge}
    </span>
  );
}
