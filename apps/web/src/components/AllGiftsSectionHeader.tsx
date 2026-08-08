export default function AllGiftsSectionHeader() {
  return (
    <div id="all-gifts" className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-10 pb-2">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-nordstrom-gray-200" />
        <p className="text-[10px] tracking-[0.25em] uppercase text-nordstrom-gray-500 whitespace-nowrap">
          Browse All Gifts
        </p>
        <div className="flex-1 h-px bg-nordstrom-gray-200" />
      </div>
    </div>
  );
}
