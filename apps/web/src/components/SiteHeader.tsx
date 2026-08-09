"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

const NAV_LINKS = [
  { label: "Anniversary Sale", href: "#" },
  { label: "New & Now", href: "#" },
  { label: "Women", href: "#" },
  { label: "Men", href: "#" },
  { label: "Beauty", href: "#" },
  { label: "Shoes", href: "#" },
  { label: "Bags", href: "#" },
  { label: "Gifts", href: "/gifts" },
  { label: "Sale", href: "#" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/gifts?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-nordstrom-gray-200">
      {/* Gifting context bar */}
      <div className="bg-nordstrom-black text-white text-xs text-center py-2 tracking-wide flex items-center justify-center gap-6">
        <span>Free shipping &amp; returns on every order</span>
        <span className="hidden sm:inline text-white/40">|</span>
        <span className="hidden sm:inline">Free gift wrapping available</span>
        <span className="hidden md:inline text-white/40">|</span>
        <span className="hidden md:inline">Gift receipts included</span>
      </div>

      {/* Search bar (expanded) */}
      {searchOpen && (
        <div className="bg-white border-b border-nordstrom-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search for brands, styles, and more..."
            className="flex-1 text-sm outline-none placeholder-nordstrom-gray-300"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="text-xs text-nordstrom-gray-500 hover:text-nordstrom-black transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main header */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-4">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-1 flex-shrink-0"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo — centered on mobile, left on desktop */}
        <div className="flex-1 flex lg:flex-none items-center justify-center lg:justify-start">
          <a href="/" className="flex-shrink-0" aria-label="Nordstrom">
            {/* Wordmark using SVG path to approximate the real thin-weight letter-spaced logo */}
            <svg width="130" height="16" viewBox="0 0 130 16" xmlns="http://www.w3.org/2000/svg">
              <text
                x="0"
                y="13"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="13"
                fontWeight="300"
                letterSpacing="4.5"
                fill="#000000"
              >
                NORDSTROM
              </text>
            </svg>
          </a>
        </div>

        {/* Desktop nav — centered */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-xs tracking-widest uppercase font-normal whitespace-nowrap hover:text-nordstrom-gray-500 transition-colors pb-0.5 ${
                label === "Anniversary Sale"
                  ? "text-nordstrom-gold font-medium"
                  : ""
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Utility icons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="p-1 hover:opacity-60 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button aria-label="Account" className="p-1 hover:opacity-60 transition-opacity hidden sm:block">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <Link href="/cart" aria-label="Shopping bag" className="p-1 hover:opacity-60 transition-opacity relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-nordstrom-black text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-nordstrom-gray-200 bg-white px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-xs tracking-widest uppercase font-normal text-nordstrom-gray-700 py-1 ${
                label === "Anniversary Sale" ? "text-nordstrom-gold" : ""
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
