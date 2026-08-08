export interface ProductVariantColor {
  name: string;
  swatch: string; // hex
  imageUrl: string;
  soldOut?: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  size: string;
  helpful: number;
}

export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  badge?: string;
  badgeType?: "sale" | "new-markdown" | "anniversary-sale" | "best-seller" | "top-rated" | "gift-with-purchase" | "beauty-exclusive";
  price: number;
  salePrice?: number;
  salePriceMax?: number;
  rating: number;
  reviewCount: number;
  viewersNow: number;
  images: string[];
  colors: ProductVariantColor[];
  sizes: { label: string; soldOut?: boolean }[];
  fitNote: string;
  details: { label: string; items: string[] }[];
  description: string;
  editorialHeadline?: string;
  editorialCopy?: string;
  attribution?: string;
  shippingNote: string;
  reviews: ReviewItem[];
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const MOONLIGHT_PAJAMAS: ProductDetail = {
  id: "6451550",
  brand: "Nordstrom",
  name: "Moonlight Eco Short Pajamas",
  badge: "Anniversary Sale",
  badgeType: "anniversary-sale" as const,
  price: 65,
  salePrice: 38.99,
  salePriceMax: 42.99,
  rating: 4.6,
  reviewCount: 984,
  viewersNow: 536,
  images: [
    "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg",
    "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg",
    "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg",
    "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg",
    "https://n.nordstrommedia.com/it/f3ef1c5a-af47-4f0c-bf92-ed37e02eff75.jpeg",
  ],
  colors: [
    { name: "Pink Ivory Riviera Stripe", swatch: "#F0C0AD", imageUrl: "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg" },
    { name: "Ivory Blue Tapestry Floral", swatch: "#B8C8D8", imageUrl: "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg" },
    { name: "Purple Thistle", swatch: "#9B7EC8", imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg" },
    { name: "Black", swatch: "#1A1A1A", imageUrl: "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg" },
    { name: "Blue Sketchbook Floral", swatch: "#4A7BAC", imageUrl: "https://n.nordstrommedia.com/it/f3ef1c5a-af47-4f0c-bf92-ed37e02eff75.jpeg" },
    { name: "Brown Elegant Leopard", swatch: "#8B6340", imageUrl: "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg", soldOut: true },
    { name: "Navy Peacoat", swatch: "#1B3A5C", imageUrl: "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg" },
    { name: "Pink Brown Dome Lines", swatch: "#C8A090", imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg" },
  ],
  sizes: [
    { label: "XXS" },
    { label: "XS" },
    { label: "S" },
    { label: "M" },
    { label: "L" },
    { label: "XL", soldOut: true },
    { label: "XXL" },
    { label: "1X" },
    { label: "2X" },
    { label: "3X", soldOut: true },
  ],
  fitNote: "Customers say the fit runs true to size",
  description:
    "These ultra-soft short pajamas are made from sustainably sourced Tencel® modal — a breathable, lightweight fabric that feels impossibly silky against your skin. Designed for all-day wear, not just bedtime.",
  editorialHeadline: "The Softest Thing She'll Own",
  editorialCopy:
    "Our Fashion Office selected these for their unmatched softness and the fact that they legitimately look good enough to wear outside. Made from recycled materials, they wash beautifully and only get softer over time.",
  attribution: "Fashion Office",
  shippingNote: "Free shipping. Free returns. All the time.",
  details: [
    {
      label: "Details & Care",
      items: [
        "26\" regular top length; 2½\" inseam",
        "Button-up collar with notched design",
        "Short-sleeve top and drawstring shorts",
        "91% Tencel® modal, 9% spandex",
        "Tencel modal is a sustainably sourced fiber made with closed-loop processing",
        "Machine wash, tumble dry",
        "Imported",
        "Item #6451550",
      ],
    },
    {
      label: "Size & Fit",
      items: [
        "XXS=00, XS=0–2, S=4–6, M=8–10, L=12–14, XL=16, XXL=18",
        "Model is 5'10\" and wearing size Small",
        "True to size fit",
      ],
    },
    {
      label: "About Nordstrom",
      items: [
        "Nordstrom offers high-quality clothing, shoes and accessories",
        "Core values: versatility, ease and affordability",
        "Sustainability-forward materials where possible",
      ],
    },
  ],
  ratingBreakdown: { 5: 68, 4: 18, 3: 8, 2: 3, 1: 3 },
  reviews: [
    {
      id: "r1",
      author: "SleepyMom",
      rating: 5,
      title: "I own 4 pairs now",
      body: "These are legitimately the softest pajamas I have ever worn. I bought my first pair two years ago and have been buying them every time they go on sale since. The fabric gets softer with every wash. I've gifted them to literally every person in my family.",
      date: "July 28, 2026",
      verified: true,
      size: "Small",
      helpful: 142,
    },
    {
      id: "r2",
      author: "GiftGiver88",
      rating: 5,
      title: "Perfect gift — she cried",
      body: "Bought these for my mom's birthday. She texted me the next morning saying they were the best gift she's ever received. I'm not even joking. The packaging is nice too. Will definitely buy again.",
      date: "July 15, 2026",
      verified: true,
      size: "Medium",
      helpful: 89,
    },
    {
      id: "r3",
      author: "EcoFashionista",
      rating: 4,
      title: "Love the fabric, sizing runs slightly small",
      body: "The Tencel modal fabric is incredible — lightweight, breathable, and so soft. I normally wear a Medium but sized up to Large and it fits perfectly. Subtract one star because the size guide didn't warn me about this. Otherwise flawless.",
      date: "June 30, 2026",
      verified: true,
      size: "Large (sized up from M)",
      helpful: 67,
    },
    {
      id: "r4",
      author: "NightOwlNancy",
      rating: 5,
      title: "Wore these on a plane and got compliments",
      body: "I live in these. I wore them on a cross-country flight and two different people asked where I got them. They look polished enough to wear outside but feel like you're wearing nothing. Buy them.",
      date: "June 12, 2026",
      verified: false,
      size: "Small",
      helpful: 54,
    },
    {
      id: "r5",
      author: "PjCritic",
      rating: 3,
      title: "Nice but pilling after 6 months",
      body: "I love the feel initially but after about 6 months of regular wear and washing they started to pill a bit, especially on the shorts. Still very soft but I expected more longevity at this price point. Worth it on sale, maybe not full price.",
      date: "May 8, 2026",
      verified: true,
      size: "Medium",
      helpful: 38,
    },
  ],
};
