const FOOTER_LINKS = [
  {
    heading: "Help",
    links: [
      "Order Status",
      "Shipping & Returns",
      "Store Pickup",
      "Contact Us",
      "Gift Cards",
      "Site Map",
    ],
  },
  {
    heading: "About Us",
    links: [
      "About Nordstrom",
      "Nordstrom Careers",
      "Investor Relations",
      "Press Room",
      "Corporate Responsibility",
      "Nordstrom Supply Chain",
    ],
  },
  {
    heading: "Get Rewarded",
    links: [
      "Nordstrom Rewards",
      "Nordstrom Card",
      "Nordstrom Rack",
      "Trunk Club",
      "Nordstrom App",
      "Gift Services",
    ],
  },
  {
    heading: "Let's Connect",
    links: [
      "Instagram",
      "Facebook",
      "Pinterest",
      "TikTok",
      "YouTube",
      "Twitter / X",
    ],
  },
];

const LEGAL_LINKS = [
  "Privacy Policy",
  "Terms & Conditions",
  "Accessibility",
  "CA Privacy Rights",
  "Cookie Preferences",
];

export default function SiteFooter() {
  return (
    <footer className="bg-nordstrom-black text-white mt-16">
      {/* Gift services banner */}
      <div className="border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 12V22H4V12" />
                  <path d="M22 7H2v5h20V7z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              ),
              title: "Free Gift Wrapping",
              desc: "Available on every order",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="2" y="3" width="20" height="14" rx="1" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 8h10M7 11h6" />
                </svg>
              ),
              title: "Gift Receipts Included",
              desc: "Easy returns for recipients",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              ),
              title: "Free Shipping & Returns",
              desc: "On every order, every day",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="text-white/60 flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main link columns */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {FOOTER_LINKS.map((col) => (
          <div key={col.heading}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mb-4">{col.heading}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-xs text-white/70 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <svg width="110" height="14" viewBox="0 0 130 16" xmlns="http://www.w3.org/2000/svg">
            <text
              x="0"
              y="13"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="13"
              fontWeight="300"
              letterSpacing="4.5"
              fill="rgba(255,255,255,0.6)"
            >
              NORDSTROM
            </text>
          </svg>

          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link, i) => (
              <span key={link} className="flex items-center gap-4">
                <a href="#" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
                  {link}
                </a>
                {i < LEGAL_LINKS.length - 1 && (
                  <span className="text-white/20 text-[10px]">|</span>
                )}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-white/30">
            © {new Date().getFullYear()} Nordstrom, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
