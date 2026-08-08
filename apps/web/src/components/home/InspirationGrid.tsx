import Image from "next/image";
import Link from "next/link";
import { INSPIRATION_GRID } from "@/lib/home-data";

export default function InspirationGrid() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-xs tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-6">Shop the Story</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {INSPIRATION_GRID.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`group relative overflow-hidden bg-nordstrom-gray-100 block ${
              i === 0 ? "sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-auto" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={item.imageUrl}
              alt={item.label}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes={i === 0 ? "(max-width: 640px) 50vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-3 text-white text-xs sm:text-sm font-medium leading-snug">
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
