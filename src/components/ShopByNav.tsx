import { PRICE_NAV, CATEGORY_NAV, OCCASION_NAV } from "@/lib/catalog-data";

interface NavRowProps {
  title: string;
  links: { label: string; href: string }[];
}

function NavRow({ title, links }: NavRowProps) {
  return (
    <div className="border-t border-nordstrom-gray-200 py-6">
      <h2 className="text-xs tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-4">{title}</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-nordstrom-gray-700 hover:text-nordstrom-black hover:underline transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ShopByNav() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
      <NavRow title="Gifts by Price" links={PRICE_NAV} />
      <NavRow title="Gifts by Category" links={CATEGORY_NAV} />
      <NavRow title="Gifts by Occasion" links={OCCASION_NAV} />
    </div>
  );
}
