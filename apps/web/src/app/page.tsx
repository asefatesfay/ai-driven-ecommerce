import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryTiles from "@/components/home/CategoryTiles";
import EditorialRow from "@/components/home/EditorialRow";
import InspirationGrid from "@/components/home/InspirationGrid";
import BrandSpot from "@/components/home/BrandSpot";
import PromoCards from "@/components/home/PromoCards";
import ServicesStrip from "@/components/home/ServicesStrip";
import { EDITORIAL_ROWS } from "@/lib/home-data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Full-width hero carousel */}
      <HeroCarousel />

      {/* Shop by category quick-links */}
      <CategoryTiles />

      {/* Promo cards: gift card offer + Nordstrom card */}
      <PromoCards />

      {/* Editorial split rows */}
      {EDITORIAL_ROWS.slice(0, 2).map((row) => (
        <EditorialRow key={row.id} {...row} />
      ))}

      {/* Inspiration grid */}
      <InspirationGrid />

      {/* More editorial rows */}
      {EDITORIAL_ROWS.slice(2).map((row) => (
        <EditorialRow key={row.id} {...row} />
      ))}

      {/* Brand partnership spotlight */}
      <BrandSpot />

      {/* Styling service + trust strip */}
      <ServicesStrip />

      <SiteFooter />
    </div>
  );
}
