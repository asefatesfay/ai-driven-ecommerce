export default function GiftHero() {
  return (
    <div className="bg-nordstrom-black text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-white/50 mb-4">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-white">Gifts</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Gifts</h1>
          <p className="text-sm text-white/60 mt-2 font-light">
            13,216 items · Free shipping &amp; returns on every gift
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase">
          <a href="#gift-edit" className="border border-white/40 px-4 py-2 hover:bg-white hover:text-black transition-colors">
            Gift Edit ↓
          </a>
          <a href="#all-gifts" className="border border-white/40 px-4 py-2 hover:bg-white hover:text-black transition-colors">
            All Gifts ↓
          </a>
        </div>
      </div>
    </div>
  );
}
