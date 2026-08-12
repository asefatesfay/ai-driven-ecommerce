import { Suspense } from "react";
import ProductPageClient from "./ProductPageClient";

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-flex gap-1.5">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    }>
      <ProductPageClient />
    </Suspense>
  );
}
