export type FilterRecipient = "for-her" | "for-him" | "for-kids" | "for-teens";
export type FilterTheme = "cozy" | "luxury" | "practical" | "outdoor" | "wellness" | "host-gift" | "stocking-stuffer";
export type FilterPrice = "under-50" | "50-100" | "100-200" | "200-plus";

export interface EditorialProduct {
  id: string;
  productId: string;
  brand: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  editorialHeadline: string;
  editorialCopy: string;
  attribution: "fashion-office" | "buyer" | "stylist";
  filters: {
    recipient: FilterRecipient[];
    theme: FilterTheme[];
    price: FilterPrice;
  };
  active: boolean;
}

export const GIFT_PRODUCTS: EditorialProduct[] = [
  {
    id: "editorial-prod-001",
    productId: "7967312",
    brand: "Dyson",
    name: "Airwrap i.d.™ Multi-styler & Dryer",
    price: 599,
    imageUrl: "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
    editorialHeadline: "The Gift She'll Actually Use Every Day",
    editorialCopy: "Our Fashion Office can't stop raving about this. It styles, dries, and curls with zero heat damage — the kind of gift that changes a morning routine forever.",
    attribution: "fashion-office",
    filters: {
      recipient: ["for-her"],
      theme: ["luxury", "wellness"],
      price: "200-plus",
    },
    active: true,
  },
  {
    id: "editorial-prod-002",
    productId: "7967313",
    brand: "UGG®",
    name: "Tazzette Shearling Slipper",
    price: 110,
    salePrice: 69.99,
    imageUrl: "https://n.nordstrommedia.com/it/09fcb8df-7ac0-42ee-b057-7b1a8e5a7d6e.jpeg",
    editorialHeadline: "Pure Cozy, Zero Effort",
    editorialCopy: "These are the slippers our entire team wears on long shoot days. Shearling-lined, cloud-soft, and the kind of cozy that makes staying in feel like a luxury.",
    attribution: "fashion-office",
    filters: {
      recipient: ["for-her", "for-him"],
      theme: ["cozy", "host-gift"],
      price: "50-100",
    },
    active: true,
  },
  {
    id: "editorial-prod-003",
    productId: "7967314",
    brand: "Nordstrom",
    name: "Moonlight Eco Short Pajamas",
    price: 68,
    salePrice: 42.99,
    imageUrl: "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg",
    editorialHeadline: "The Softest Thing She'll Own",
    editorialCopy: "Made from recycled materials, these pajamas feel impossibly soft and wash beautifully. A thoughtful gift that's good for her and the planet.",
    attribution: "buyer",
    filters: {
      recipient: ["for-her"],
      theme: ["cozy", "practical"],
      price: "50-100",
    },
    active: true,
  },
  {
    id: "editorial-prod-004",
    productId: "7967315",
    brand: "Voluspa",
    name: "Macaron Candle Trio",
    price: 54,
    imageUrl: "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg",
    editorialHeadline: "The Host Gift That Never Misses",
    editorialCopy: "Three of Voluspa's most beloved scents in one elegant set. Wrap it, and you're done. Our buyers have been gifting this for three years running.",
    attribution: "buyer",
    filters: {
      recipient: ["for-her", "for-him"],
      theme: ["host-gift", "luxury", "stocking-stuffer"],
      price: "50-100",
    },
    active: true,
  },
  {
    id: "editorial-prod-005",
    productId: "7967316",
    brand: "BLISSY",
    name: "Mulberry Silk Pillowcase",
    price: 89,
    salePrice: 54.99,
    imageUrl: "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg",
    editorialHeadline: "Sleep Like You're at a Hotel Every Night",
    editorialCopy: "Once you sleep on silk, there's no going back. Our stylists swear this has changed their skin and hair. It's the sneaky-luxurious gift they didn't know they needed.",
    attribution: "stylist",
    filters: {
      recipient: ["for-her"],
      theme: ["wellness", "luxury", "cozy"],
      price: "50-100",
    },
    active: true,
  },
  {
    id: "editorial-prod-006",
    productId: "7967317",
    brand: "NODPOD",
    name: "Weighted Sleep Mask",
    price: 38,
    imageUrl: "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg",
    editorialHeadline: "The Secret to a Deeper Sleep",
    editorialCopy: "Gentle gravity pressure over your eyes — it sounds simple, but our team became obsessed with this immediately. Perfect for frequent travelers or light sleepers.",
    attribution: "fashion-office",
    filters: {
      recipient: ["for-her", "for-him"],
      theme: ["wellness", "stocking-stuffer", "practical"],
      price: "under-50",
    },
    active: true,
  },
  {
    id: "editorial-prod-007",
    productId: "7967318",
    brand: "Erin McDermott Jewelry",
    name: "Heart Necklace",
    price: 110,
    salePrice: 38,
    imageUrl: "https://n.nordstrommedia.com/it/f3ef1c5a-af47-4f0c-bf92-ed37e02eff75.jpeg",
    editorialHeadline: "Small Gift, Big Feeling",
    editorialCopy: "Delicate enough to wear every day, meaningful enough to remember. Our Fashion Office editors reach for dainty pieces like this when they want something that feels personal.",
    attribution: "fashion-office",
    filters: {
      recipient: ["for-her", "for-teens"],
      theme: ["luxury", "stocking-stuffer"],
      price: "under-50",
    },
    active: true,
  },
  {
    id: "editorial-prod-008",
    productId: "7967319",
    brand: "The North Face",
    name: "Hydrenalite Down Jacket",
    price: 220,
    imageUrl: "https://n.nordstrommedia.com/it/a24de572-98ae-4f12-889d-01e9272a849a.jpeg",
    editorialHeadline: "Warmth That Goes Anywhere",
    editorialCopy: "Ultra-packable, wind-resistant, and still looks sharp enough for the city. This is the jacket our buyers gift to everyone on their list — men, women, outdoorsy types, commuters.",
    attribution: "buyer",
    filters: {
      recipient: ["for-her", "for-him"],
      theme: ["outdoor", "practical"],
      price: "200-plus",
    },
    active: true,
  },
  {
    id: "editorial-prod-009",
    productId: "7967320",
    brand: "New Balance",
    name: "327 Sneaker",
    price: 100,
    imageUrl: "https://n.nordstrommedia.com/it/7f176cd1-ce0c-4391-8776-a09f93107455.jpeg",
    editorialHeadline: "The Sneaker Everyone Will Actually Wear",
    editorialCopy: "Vintage silhouette, modern comfort. The 327 has been on our team's feet for two seasons straight. It's the sneaker gift that doesn't collect dust — it gets worn immediately.",
    attribution: "stylist",
    filters: {
      recipient: ["for-her", "for-him", "for-teens"],
      theme: ["practical", "outdoor"],
      price: "100-200",
    },
    active: true,
  },
  {
    id: "editorial-prod-010",
    productId: "7967321",
    brand: "tonies",
    name: "Toniebox 2 Starter Set",
    price: 99,
    imageUrl: "https://n.nordstrommedia.com/it/29266f06-7cbf-4d1e-ab25-0ae485f055d3.jpeg",
    editorialHeadline: "The Kids' Gift That Gives You Peace Too",
    editorialCopy: "Screen-free audio play that kids ages 3–7 operate entirely on their own. Our buyers' kids asked for a second one. That says everything.",
    attribution: "buyer",
    filters: {
      recipient: ["for-kids"],
      theme: ["practical"],
      price: "50-100",
    },
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
