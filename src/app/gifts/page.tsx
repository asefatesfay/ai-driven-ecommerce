import SiteHeader from "@/components/SiteHeader";
import GiftHero from "@/components/GiftHero";
import RecipientTiles from "@/components/RecipientTiles";
import ShopByNav from "@/components/ShopByNav";
import FeaturedBanners from "@/components/FeaturedBanners";
import GiftEditSectionHeader from "@/components/GiftEditSectionHeader";
import GiftEditGrid from "@/components/GiftEditGrid";
import AllGiftsSectionHeader from "@/components/AllGiftsSectionHeader";
import StandardProductGrid from "@/components/StandardProductGrid";
import SiteFooter from "@/components/SiteFooter";

export default function GiftEditPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Page hero + breadcrumb */}
      <GiftHero />

      {/* ── Standard gifts structure ─────────────────────── */}

      {/* Shop by recipient tiles */}
      <RecipientTiles />

      {/* Shop by price / category / occasion nav rows */}
      <ShopByNav />

      {/* Featured collection banners */}
      <FeaturedBanners />

      {/* ── New: Editorial Gift Edit section ─────────────── */}

      <GiftEditSectionHeader />
      <GiftEditGrid />

      {/* ── Standard product grid (existing browse behaviour) */}

      <AllGiftsSectionHeader />
      <StandardProductGrid />
      <SiteFooter />
    </div>
  );
}
