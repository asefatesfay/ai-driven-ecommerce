import Image from "next/image";
import Link from "next/link";
import { PROMO_CARDS } from "@/lib/home-data";

export default function PromoCards() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROMO_CARDS.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative aspect-[8/5] overflow-hidden block bg-nordstrom-gray-100"
          >
            <Image
              src={card.imageUrl}
              alt={card.headline}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className={`absolute inset-0 ${card.dark ? "bg-black/40" : "bg-white/20"}`} />
            <div className="absolute bottom-6 left-6 right-6">
              <p className={`text-[10px] tracking-[0.2em] uppercase mb-1.5 ${card.dark ? "text-white/70" : "text-nordstrom-black/60"}`}>
                {card.eyebrow}
              </p>
              <h3 className={`text-xl sm:text-2xl font-light leading-tight mb-2 whitespace-pre-line ${card.dark ? "text-white" : "text-nordstrom-black"}`}>
                {card.headline}
              </h3>
              <p className={`text-xs mb-4 ${card.dark ? "text-white/80" : "text-nordstrom-gray-700"}`}>
                {card.body}
              </p>
              <span className={`inline-block text-[10px] tracking-widest uppercase px-5 py-2 transition-colors ${
                card.dark
                  ? "bg-white text-nordstrom-black hover:bg-nordstrom-gray-100"
                  : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
              }`}>
                {card.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
