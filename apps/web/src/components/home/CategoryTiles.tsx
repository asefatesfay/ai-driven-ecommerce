import Image from "next/image";
import Link from "next/link";
import { CATEGORY_TILES } from "@/lib/home-data";

export default function CategoryTiles() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORY_TILES.map((tile) => (
          <Link key={tile.label} href={tile.href} className="group flex flex-col items-center gap-2 text-center">
            <div className="relative w-full aspect-square overflow-hidden bg-nordstrom-gray-100">
              <Image
                src={tile.imageUrl}
                alt={tile.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, 16vw"
              />
            </div>
            <span className="text-xs tracking-wide text-nordstrom-gray-700 group-hover:text-nordstrom-black transition-colors leading-tight">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
