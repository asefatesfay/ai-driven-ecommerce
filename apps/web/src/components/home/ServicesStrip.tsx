import Image from "next/image";
import Link from "next/link";

export default function ServicesStrip() {
  return (
    <section className="border-y border-nordstrom-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row">
          {/* Styling service */}
          <Link href="#" className="group relative flex-1 aspect-[16/7] overflow-hidden bg-nordstrom-gray-100 block">
            <Image
              src="https://n.nordstrommedia.com/is/image/nordstrom/SERVICES_1023_STYLING_9336.jpeg"
              alt="Personal Styling"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/60 mb-1">Complimentary</p>
              <h3 className="text-xl sm:text-2xl font-light text-white mb-2">Personal Styling</h3>
              <p className="text-xs text-white/80 mb-4">One-on-one sessions in store or virtual — free for everyone.</p>
              <span className="self-start text-[10px] tracking-widest uppercase bg-white text-nordstrom-black px-5 py-2 hover:bg-nordstrom-gray-100 transition-colors">
                Book an Appointment
              </span>
            </div>
          </Link>

          {/* Trust strip — vertical on mobile, side column on desktop */}
          <div className="flex-shrink-0 sm:w-72 flex flex-col divide-y divide-nordstrom-gray-200 border-t sm:border-t-0 sm:border-l border-nordstrom-gray-200">
            {[
              { icon: "truck", title: "Free Shipping", desc: "On every order, every day" },
              { icon: "return", title: "Free Returns", desc: "In store or by mail, always free" },
              { icon: "gift", title: "Gift Services", desc: "Wrapping, messages & gift receipts" },
              { icon: "card", title: "Nordstrom Card", desc: "Earn rewards on every purchase" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-nordstrom-gray-500">
                  {item.icon === "truck" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  )}
                  {item.icon === "return" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                    </svg>
                  )}
                  {item.icon === "gift" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                  )}
                  {item.icon === "card" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-nordstrom-black">{item.title}</p>
                  <p className="text-[10px] text-nordstrom-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
