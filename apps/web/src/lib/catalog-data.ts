export interface ProductColor {
  name: string;
  hex: string;
}

export interface CatalogProduct {
  id: string;
  productId?: number;
  brand: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badge?: string;
  badgeType?: "sale" | "best-seller" | "top-rated" | "gift-with-purchase" | "beauty-exclusive" | "new-markdown" | "anniversary-sale";
  recipient: ("her" | "him" | "kids" | "teens" | "pets")[];
  priceRange: "under-25" | "under-50" | "under-100" | "luxe" | "sale";
  category: "beauty" | "apparel" | "home" | "shoes" | "accessories" | "tech" | "wellness" | "toys";
  occasion: ("birthday" | "wedding" | "baby-shower" | "housewarming" | "graduation" | "just-because")[];
  colors: ProductColor[];
  sizes: string[];
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    // Mirrors editorial-prod-001
    id: "cat-001",
    brand: "Dyson",
    name: "Airwrap i.d.™ Complete Multi-Styler & Dryer",
    price: 599.99,
    rating: 4.8,
    reviewCount: 2341,
    imageUrl: "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
    badge: "Beauty Exclusive",
    badgeType: "beauty-exclusive",
    recipient: ["her"],
    priceRange: "luxe",
    category: "beauty",
    occasion: ["birthday", "graduation"],
    colors: [
      { name: "Nickel/Copper", hex: "#A8A8A0" },
      { name: "Prussian Blue", hex: "#003153" },
      { name: "Vinca Blue/Rose", hex: "#6B8FAE" },
    ],
    sizes: [],
  },
  {
    // Mirrors editorial-prod-002
    id: "cat-002",
    brand: "UGG®",
    name: "Tazzette Platform Shearling Slipper",
    price: 120,
    salePrice: 74.99,
    rating: 4.7,
    reviewCount: 1108,
    imageUrl: "https://n.nordstrommedia.com/it/09fcb8df-7ac0-42ee-b057-7b1a8e5a7d6e.jpeg",
    badge: "Sale",
    badgeType: "sale",
    recipient: ["her", "him"],
    priceRange: "under-100",
    category: "shoes",
    occasion: ["birthday", "just-because"],
    colors: [
      { name: "Chestnut", hex: "#C4915E" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Sand", hex: "#D4B896" },
      { name: "Goat", hex: "#E8DDD0" },
    ],
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
  },
  {
    // Mirrors editorial-prod-003
    id: "cat-003",
    brand: "Barefoot Dreams",
    name: "CozyChic® Lite Circle Cardigan",
    price: 128,
    rating: 4.9,
    reviewCount: 3892,
    imageUrl: "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg",
    badge: "Best Seller",
    badgeType: "best-seller",
    recipient: ["her"],
    priceRange: "luxe",
    category: "apparel",
    occasion: ["birthday", "just-because"],
    colors: [
      { name: "Cream", hex: "#F5F0E8" },
      { name: "Stone", hex: "#C8B8A8" },
      { name: "Dusty Rose", hex: "#D4A0A0" },
      { name: "Carbon", hex: "#3A3A3A" },
    ],
    sizes: ["XS/S", "M/L", "XL/XXL"],
  },
  {
    // Mirrors editorial-prod-004
    id: "cat-004",
    brand: "Voluspa",
    name: "Japonica 5-Piece Mini Candle Set",
    price: 48,
    rating: 4.7,
    reviewCount: 614,
    imageUrl: "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg",
    badge: "Gift with Purchase",
    badgeType: "gift-with-purchase",
    recipient: ["her", "him"],
    priceRange: "under-50",
    category: "home",
    occasion: ["birthday", "housewarming", "just-because"],
    colors: [
      { name: "Crane Flower", hex: "#E8B8A0" },
      { name: "Perse Bloom", hex: "#C8A0C8" },
      { name: "Baltic Amber", hex: "#D4A850" },
    ],
    sizes: [],
  },
  {
    // Mirrors editorial-prod-005
    id: "cat-005",
    brand: "The North Face",
    name: "ThermoBall™ Eco Jacket",
    price: 230,
    rating: 4.8,
    reviewCount: 2087,
    imageUrl: "https://n.nordstrommedia.com/it/a24de572-98ae-4f12-889d-01e9272a849a.jpeg",
    badge: "Best Seller",
    badgeType: "best-seller",
    recipient: ["her", "him"],
    priceRange: "luxe",
    category: "apparel",
    occasion: ["birthday", "graduation"],
    colors: [
      { name: "TNF Black", hex: "#1A1A1A" },
      { name: "Summit Navy", hex: "#1B3A5C" },
      { name: "Chlorophyll Green", hex: "#3A6B45" },
      { name: "Radiant Orange", hex: "#D4521A" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    // Mirrors editorial-prod-006
    id: "cat-006",
    brand: "New Balance",
    name: "327 Sneaker",
    price: 89.95,
    rating: 4.6,
    reviewCount: 2978,
    imageUrl: "https://n.nordstrommedia.com/it/7f176cd1-ce0c-4391-8776-a09f93107455.jpeg",
    recipient: ["her", "him", "teens"],
    priceRange: "under-100",
    category: "shoes",
    occasion: ["birthday", "graduation", "just-because"],
    colors: [
      { name: "White/Sea Salt", hex: "#F0EDE8" },
      { name: "Black/White", hex: "#1A1A1A" },
      { name: "NB Navy", hex: "#1B3A5C" },
      { name: "Vintage Rose", hex: "#C8A0A0" },
    ],
    sizes: ["6", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11"],
  },
  {
    // Additional products for the standard grid below the editorial section
    id: "cat-007",
    brand: "Dyson",
    name: "Supersonic™ Hair Dryer",
    price: 429.99,
    rating: 4.7,
    reviewCount: 4120,
    imageUrl: "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
    badge: "Anniversary Sale",
    badgeType: "anniversary-sale",
    recipient: ["her"],
    priceRange: "luxe",
    category: "beauty",
    occasion: ["birthday", "graduation"],
    colors: [
      { name: "Black/Nickel", hex: "#2A2A2A" },
      { name: "Ceramic Pink", hex: "#E8B4A0" },
      { name: "Prussian Blue", hex: "#003153" },
    ],
    sizes: [],
  },
  {
    id: "cat-008",
    brand: "UGG®",
    name: "Classic Ultra Mini Boot",
    price: 160,
    rating: 4.8,
    reviewCount: 1567,
    imageUrl: "https://n.nordstrommedia.com/it/09fcb8df-7ac0-42ee-b057-7b1a8e5a7d6e.jpeg",
    recipient: ["her"],
    priceRange: "luxe",
    category: "shoes",
    occasion: ["birthday", "just-because"],
    colors: [
      { name: "Chestnut", hex: "#C4915E" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Natural", hex: "#D4C4A8" },
    ],
    sizes: ["5", "6", "7", "8", "9", "10"],
  },
  {
    id: "cat-009",
    brand: "BLISSY",
    name: "Mulberry Silk Pillowcase",
    price: 89,
    salePrice: 54.99,
    rating: 4.5,
    reviewCount: 672,
    imageUrl: "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg",
    badge: "Sale",
    badgeType: "sale",
    recipient: ["her"],
    priceRange: "under-100",
    category: "home",
    occasion: ["birthday", "just-because"],
    colors: [
      { name: "Blush", hex: "#F0C0AD" },
      { name: "White", hex: "#F5F5F5" },
      { name: "Champagne", hex: "#F5E6C8" },
      { name: "Navy", hex: "#1B3A5C" },
    ],
    sizes: ["Standard", "King"],
  },
  {
    id: "cat-010",
    brand: "NODPOD",
    name: "Weighted Sleep Mask",
    price: 38,
    rating: 4.7,
    reviewCount: 1890,
    imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg",
    badge: "Top Rated",
    badgeType: "top-rated",
    recipient: ["her", "him"],
    priceRange: "under-50",
    category: "wellness",
    occasion: ["birthday", "just-because"],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Gray", hex: "#888888" },
      { name: "Blush", hex: "#F0C0AD" },
    ],
    sizes: [],
  },
  {
    id: "cat-011",
    brand: "Erin McDermott Jewelry",
    name: "Heart Necklace",
    price: 110,
    salePrice: 38,
    rating: 4.8,
    reviewCount: 334,
    imageUrl: "https://n.nordstrommedia.com/it/f3ef1c5a-af47-4f0c-bf92-ed37e02eff75.jpeg",
    badge: "Sale",
    badgeType: "sale",
    recipient: ["her", "teens"],
    priceRange: "under-50",
    category: "accessories",
    occasion: ["birthday", "graduation", "just-because"],
    colors: [
      { name: "Gold", hex: "#B8962E" },
      { name: "Silver", hex: "#A0A0A0" },
      { name: "Rose Gold", hex: "#C8956C" },
    ],
    sizes: [],
  },
  {
    id: "cat-012",
    brand: "tonies",
    name: "Toniebox 2 Starter Set",
    price: 99,
    rating: 4.9,
    reviewCount: 3201,
    imageUrl: "https://n.nordstrommedia.com/it/29266f06-7cbf-4d1e-ab25-0ae485f055d3.jpeg",
    badge: "Top Rated",
    badgeType: "top-rated",
    recipient: ["kids"],
    priceRange: "under-100",
    category: "toys",
    occasion: ["birthday", "baby-shower"],
    colors: [
      { name: "Teal", hex: "#2D9B8A" },
      { name: "Purple", hex: "#7B52AB" },
      { name: "Orange", hex: "#E87722" },
    ],
    sizes: [],
  },
];

export const RECIPIENT_NAV = [
  { label: "For Her", href: "#", imageUrl: "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg" },
  { label: "For Him", href: "#", imageUrl: "https://n.nordstrommedia.com/it/a24de572-98ae-4f12-889d-01e9272a849a.jpeg" },
  { label: "For Teens", href: "#", imageUrl: "https://n.nordstrommedia.com/it/7f176cd1-ce0c-4391-8776-a09f93107455.jpeg" },
  { label: "For Kids & Babies", href: "#", imageUrl: "https://n.nordstrommedia.com/it/29266f06-7cbf-4d1e-ab25-0ae485f055d3.jpeg" },
  { label: "For Pets", href: "#", imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg" },
  { label: "Has Everything", href: "#", imageUrl: "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg" },
];

export const PRICE_NAV = [
  { label: "Under $25", href: "#" },
  { label: "Under $50", href: "#" },
  { label: "Under $100", href: "#" },
  { label: "Luxe Gifts", href: "#" },
  { label: "Sale", href: "#" },
];

export const CATEGORY_NAV = [
  { label: "Accessories", href: "#" },
  { label: "Beauty", href: "#" },
  { label: "Cozy", href: "#" },
  { label: "Handbags", href: "#" },
  { label: "Home", href: "#" },
  { label: "Jewelry", href: "#" },
  { label: "Party Host", href: "#" },
  { label: "Sports Fan", href: "#" },
  { label: "Tech", href: "#" },
  { label: "Toys", href: "#" },
  { label: "Wellness", href: "#" },
];

export const OCCASION_NAV = [
  { label: "Baby Shower", href: "#" },
  { label: "Birthday", href: "#" },
  { label: "Graduation", href: "#" },
  { label: "Housewarming", href: "#" },
  { label: "Wedding", href: "#" },
];

export const FEATURED_BANNERS = [
  {
    id: "feat-1",
    title: "Gifts for New Babies",
    subtitle: "Sweet picks for tiny humans",
    href: "#",
    imageUrl: "https://n.nordstrommedia.com/it/29266f06-7cbf-4d1e-ab25-0ae485f055d3.jpeg",
  },
  {
    id: "feat-2",
    title: "The Best Wellness Gifts",
    subtitle: "For the self-care obsessed",
    href: "#",
    imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg",
  },
  {
    id: "feat-3",
    title: "Wedding Gifts",
    subtitle: "For the couple & wedding party",
    href: "#",
    imageUrl: "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg",
  },
  {
    id: "feat-4",
    title: "Just-Because Gifts",
    subtitle: "No occasion needed",
    href: "#",
    imageUrl: "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg",
  },
];
