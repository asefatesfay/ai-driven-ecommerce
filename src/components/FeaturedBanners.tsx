import Image from "next/image";
import { FEATURED_BANNERS } from "@/lib/catalog-data";

export default function FeaturedBanners() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 border-t border-nordstrom-gray-200">
      <h2 className="text-xs tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-5">
        Featured Collections
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURED_BANNERS.map((banner) => (
          <a
            key={banner.id}
            href={banner.href}
            className="group relative overflow-hidden aspect-[3/4] bg-nordstrom-gray-100 block"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-medium leading-tight">{banner.title}</p>
              <p className="text-xs text-white/80 mt-0.5">{banner.subtitle}</p>
            </div>
            {/* Arrow */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
