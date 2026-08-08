export default function FulfillmentOptions({ shippingNote }: { shippingNote: string }) {
  return (
    <div className="border border-nordstrom-gray-200 divide-y divide-nordstrom-gray-200">
      {/* Shipping */}
      <div className="flex items-start gap-3 p-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5 text-nordstrom-gray-700">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <div>
          <p className="text-xs font-medium text-nordstrom-black">Free Shipping</p>
          <p className="text-[11px] text-nordstrom-gray-500 mt-0.5">{shippingNote}</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto mt-0.5 text-nordstrom-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Returns */}
      <div className="flex items-start gap-3 p-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5 text-nordstrom-gray-700">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
        </svg>
        <div>
          <p className="text-xs font-medium text-nordstrom-black">Free Returns</p>
          <p className="text-[11px] text-nordstrom-gray-500 mt-0.5">In store or by mail, always free</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto mt-0.5 text-nordstrom-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Store pickup */}
      <div className="flex items-start gap-3 p-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5 text-nordstrom-gray-700">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <div>
          <p className="text-xs font-medium text-nordstrom-black">Free Store Pickup</p>
          <p className="text-[11px] text-nordstrom-gray-500 mt-0.5">Check availability at your store</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto mt-0.5 text-nordstrom-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Gift options */}
      <div className="flex items-start gap-3 p-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5 text-nordstrom-gray-700">
          <path d="M20 12V22H4V12" />
          <path d="M22 7H2v5h20V7z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        <div>
          <p className="text-xs font-medium text-nordstrom-black">Gift Options Available</p>
          <p className="text-[11px] text-nordstrom-gray-500 mt-0.5">Gift message, box &amp; bag available at checkout</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto mt-0.5 text-nordstrom-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
