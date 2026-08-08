import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editorial CMS",
  description: "AI-driven editorial copy generator — internal tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
          <span className="font-semibold text-lg tracking-tight">Editorial CMS</span>
          <nav className="flex gap-5 text-sm">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Drafts</a>
            <a href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">Generate New</a>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
