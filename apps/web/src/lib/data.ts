export type FilterRecipient = "for-her" | "for-him" | "for-kids" | "for-teens";
export type FilterTheme = "cozy" | "luxury" | "practical" | "outdoor" | "wellness" | "host-gift" | "stocking-stuffer";
export type FilterPrice = "under-50" | "50-100" | "100-200" | "200-plus";

export interface EditorialProduct {
  id: string;
  productId: string;
  numericProductId?: number;
  brand: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  editorialHeadline: string;
  editorialCopy: string;
  attribution: "fashion-office" | "buyer" | "stylist";
  colors: { name: string; hex: string }[];
  filters: {
    recipient: FilterRecipient[];
    theme: FilterTheme[];
    price: FilterPrice;
  };
  active: boolean;
}

// 6 products from nordstrom.com/browse/gifts — real CDN images scraped directly.
// First 4 are the exact items visible in products.png screenshot.
export const GIFT_PRODUCTS: EditorialProduct[] = [
  {
    // Screenshot card 1: SALT & STONE body mist $48, rating 4.4 (5,969)
    id: "editorial-prod-001",
    productId: "SS-BODYMIST-4PK",
    brand: "SALT & STONE",
    name: "4-Piece Mini Body Mist Discovery Set $48 Value",
    price: 48,
    rating: 4.4,
    reviewCount: 5969,
    imageUrl: "https://n.nordstrommedia.com/it/4c4ced36-b66a-4815-ab3a-e2502b009cd8.jpeg",
    editorialHeadline: "The Stocking Stuffer That Smells Like a Spa",
    editorialCopy: "Four scents, one box, zero wrapping required. Our buyers reorder this every year — it photographs beautifully, travels perfectly, and nobody is ever disappointed to receive it.",
    attribution: "buyer",
    colors: [],
    filters: { recipient: ["for-her"], theme: ["stocking-stuffer", "wellness", "host-gift"], price: "under-50" },
    active: true,
  },
  {
    // Screenshot card 2: Nordstrom Moonlight Eco Knit Pajamas $85, rating 4.5 (1,232), "New" badge
    id: "editorial-prod-002",
    productId: "6451545",
    brand: "Nordstrom",
    name: "Moonlight Eco Knit Pajamas",
    price: 85,
    rating: 4.5,
    reviewCount: 1232,
    imageUrl: "https://n.nordstrommedia.com/it/c2543c6f-bc97-4657-a5cb-fbd87d5e2afd.jpeg",
    editorialHeadline: "The Pajamas That Actually Look Good",
    editorialCopy: "Most pajamas are for sleeping. These get worn to the kitchen, on video calls, and everywhere else. The knit is impossibly soft and the fit is relaxed without looking sloppy.",
    attribution: "fashion-office",
    colors: [
      { name: "Blue Stripe", hex: "#8BA7C2" },
      { name: "Navy",        hex: "#1B3A5C" },
      { name: "Blush",       hex: "#F0C0AD" },
      { name: "Sage",        hex: "#8FAE8C" },
      { name: "Black",       hex: "#1A1A1A" },
      { name: "Oatmeal",     hex: "#D4C4A8" },
    ],
    filters: { recipient: ["for-her"], theme: ["cozy", "practical"], price: "50-100" },
    active: true,
  },
  {
    // Screenshot card 4: Maison Francis Kurkdjian Baccarat Rouge 540 Body Oil $125, rating 3.8 (126), sponsored
    id: "editorial-prod-003",
    productId: "MFK-BR540-BODY",
    brand: "Maison Francis Kurkdjian",
    name: "Baccarat Rouge 540 Scented Body Oil",
    price: 125,
    rating: 3.8,
    reviewCount: 126,
    imageUrl: "https://n.nordstrommedia.com/it/bbb6276b-bb19-4c46-8fa8-09a3cebd8dfd.jpeg",
    editorialHeadline: "The Scent That Starts a Conversation",
    editorialCopy: "Baccarat Rouge 540 in a body oil means the scent stays all day — and people ask about it. Our beauty team considers this the most universally admired luxury fragrance gift on the floor.",
    attribution: "stylist",
    colors: [],
    filters: { recipient: ["for-her", "for-him"], theme: ["luxury"], price: "100-200" },
    active: true,
  },
  {
    // UGG Tazzette — top-3 on gifts page, adjacent to screenshot
    id: "editorial-prod-004",
    productId: "UGG-TAZZETTE-SC",
    brand: "UGG®",
    name: "Tazzette Genuine Shearling Collar Slipper",
    price: 105,
    rating: 4.7,
    reviewCount: 1108,
    imageUrl: "https://n.nordstrommedia.com/it/d1180980-1d11-4d3e-8a9d-ef42c2cd73aa.jpeg",
    editorialHeadline: "Cozy Season's Most Gifted Item",
    editorialCopy: "Nine out of ten team members asked for these unprompted. Genuine shearling collar, cloud-light sole. They make staying in feel like a five-star experience.",
    attribution: "fashion-office",
    colors: [
      { name: "Chestnut", hex: "#C4915E" },
      { name: "Black",    hex: "#1A1A1A" },
      { name: "Sand",     hex: "#D4B896" },
      { name: "Goat",     hex: "#E8DDD0" },
    ],
    filters: { recipient: ["for-her"], theme: ["cozy", "host-gift"], price: "100-200" },
    active: true,
  },
  {
    // Dyson Airwrap — perennial #1 on Nordstrom gift guide
    id: "editorial-prod-005",
    productId: "7967312",
    brand: "Dyson",
    name: "Airwrap i.d.™ Multi-styler and Dryer Straight+Wavy",
    price: 649.99,
    rating: 4.8,
    reviewCount: 2341,
    imageUrl: "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
    editorialHeadline: "The One Gift That Changes Her Entire Morning",
    editorialCopy: "Our Fashion Office has debated many things. This is not one of them. Styles, curls, and dries with zero heat damage — and it genuinely earns permanent counter space.",
    attribution: "fashion-office",
    colors: [
      { name: "Nickel/Copper",   hex: "#A8A8A0" },
      { name: "Prussian Blue",   hex: "#003153" },
      { name: "Vinca Blue/Rose", hex: "#6B8FAE" },
    ],
    filters: { recipient: ["for-her"], theme: ["luxury", "wellness"], price: "200-plus" },
    active: true,
  },
  {
    // NODPOD — consistently on the gifts page
    id: "editorial-prod-006",
    productId: "7967316",
    brand: "NODPOD",
    name: "Sleep Mask",
    price: 38,
    rating: 4.7,
    reviewCount: 1890,
    imageUrl: "https://n.nordstrommedia.com/it/b682f67c-dbe4-41a9-83bf-433939ed3c07.jpeg",
    editorialHeadline: "The Secret to a Deeper Sleep",
    editorialCopy: "Gentle gravity pressure over your eyes. It sounds simple, but our team became obsessed immediately. Perfect for frequent travelers, light sleepers, or anyone who needs to switch off.",
    attribution: "buyer",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Gray",  hex: "#888888" },
      { name: "Blush", hex: "#F0C0AD" },
    ],
    filters: { recipient: ["for-her", "for-him"], theme: ["wellness", "stocking-stuffer", "practical"], price: "under-50" },
    active: true,
  },
];

export const FILTER_LABELS = {
  recipient: {
    "for-her": "For Her",
    "for-him": "For Him",
    "for-kids": "For Kids",
    "for-teens": "For Teens",
  },
  theme: {
    cozy: "Cozy",
    luxury: "Luxury",
    practical: "Practical",
    outdoor: "Outdoor",
    wellness: "Wellness",
    "host-gift": "Host Gifts",
    "stocking-stuffer": "Stocking Stuffers",
  },
  price: {
    "under-50": "Under $50",
    "50-100": "$50 – $100",
    "100-200": "$100 – $200",
    "200-plus": "$200+",
  },
};

export const ATTRIBUTION_LABELS = {
  "fashion-office": "Fashion Office Pick",
  buyer: "Buyer's Choice",
  stylist: "Stylist Favorite",
};
