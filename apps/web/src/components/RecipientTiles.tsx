import Image from "next/image";
import { RECIPIENT_NAV } from "@/lib/catalog-data";

export default function RecipientTiles() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-xs tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-5">
        Gifts by Recipient
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {RECIPIENT_NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <div className="relative w-full aspect-square overflow-hidden bg-nordstrom-gray-100">
              <Image
                src={item.imageUrl}
                alt={item.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, 16vw"
              />
            </div>
            <span className="text-xs tracking-wide text-nordstrom-gray-700 group-hover:text-nordstrom-black transition-colors leading-tight">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
