import Image from "next/image";
import Link from "next/link";
import { BRAND_SPOTS } from "@/lib/home-data";

export default function BrandSpot() {
  return (
    <section className="bg-nordstrom-gray-50 border-y border-nordstrom-gray-200">
      {BRAND_SPOTS.map((spot) => (
        <div key={spot.id} className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Heading */}
          <div className="text-center mb-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-nordstrom-gray-500 mb-2">{spot.brand}</p>
            <h2 className="text-2xl sm:text-3xl font-light text-nordstrom-black">{spot.headline}</h2>
            <p className="text-sm text-nordstrom-gray-700 mt-2 max-w-sm mx-auto">{spot.body}</p>
            <Link
              href={spot.href}
              className="inline-block mt-4 text-[11px] tracking-widest uppercase bg-nordstrom-black text-white px-8 py-2.5 hover:bg-nordstrom-gray-700 transition-colors"
            >
              {spot.cta}
            </Link>
          </div>

          {/* Dual image */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={spot.imageLeft}
                alt={`${spot.brand} 1`}
                fill
                className="object-cover hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 50vw"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={spot.imageRight}
                alt={`${spot.brand} 2`}
                fill
                className="object-cover hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 50vw"
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
