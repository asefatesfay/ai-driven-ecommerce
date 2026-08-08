import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holiday Gift Edit 2026 | Nordstrom",
  description: "Our editors' picks for the perfect holiday gifts — curated by the Fashion Office.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
