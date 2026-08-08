export default function GiftEditSectionHeader() {
  return (
    <div id="gift-edit" className="bg-nordstrom-cream border-y border-nordstrom-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-nordstrom-gray-500 mb-2">
              Fashion Office Curated
            </p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-nordstrom-black">
              Holiday Gift Edit
            </h2>
            <p className="text-sm text-nordstrom-gray-700 mt-2 font-light max-w-md">
              Every pick comes with a story. Our editors tell you exactly why they chose it.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-nordstrom-gray-500">
            <span className="w-4 h-px bg-nordstrom-gray-300 inline-block" />
            <span className="tracking-widest uppercase">300 curated pieces · Holiday 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
