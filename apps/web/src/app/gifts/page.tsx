import { Suspense } from "react";
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
      <GiftHero />
      <RecipientTiles />
      <ShopByNav />
      <FeaturedBanners />
      <GiftEditSectionHeader />
      <Suspense fallback={
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-nordstrom-gray-100 mb-3" />
                <div className="h-2.5 bg-nordstrom-gray-100 w-1/3 mb-2" />
                <div className="h-3 bg-nordstrom-gray-100 w-3/4 mb-1.5" />
                <div className="h-2.5 bg-nordstrom-gray-100 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      }>
        <GiftEditGrid />
      </Suspense>
      <AllGiftsSectionHeader />
      <Suspense fallback={
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-nordstrom-gray-100 mb-3" />
                <div className="h-2.5 bg-nordstrom-gray-100 w-1/3 mb-2" />
                <div className="h-3 bg-nordstrom-gray-100 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      }>
        <StandardProductGrid />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
