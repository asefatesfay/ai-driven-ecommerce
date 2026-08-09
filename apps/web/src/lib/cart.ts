const CHECKOUT_BASE = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "http://localhost:8084";

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  style_id: string;
  name: string;
  brand: string;
  image_url: string;
  size: string;
  color_name: string;
  quantity: number;
  price: number;
  unit_price: number;
}

export interface Cart {
  id: number;
  session_id: string;
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

export function cartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("cart_session_id");
  if (!id) {
    id = "cart_" + Math.random().toString(36).slice(2, 14);
    sessionStorage.setItem("cart_session_id", id);
  }
  return id;
}

export async function addToCart(productId: number, quantity: number, unitPrice: number): Promise<Cart> {
  const sessionId = cartSessionId();
  const res = await fetch(
    `${CHECKOUT_BASE}/api/v1/cart/items?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity, unit_price: unitPrice }),
    }
  );
  if (!res.ok) throw new Error(`addToCart: ${res.status}`);
  return res.json();
}

export async function getCart(): Promise<Cart> {
  const sessionId = cartSessionId();
  const res = await fetch(
    `${CHECKOUT_BASE}/api/v1/cart?session_id=${encodeURIComponent(sessionId)}`
  );
  if (!res.ok) throw new Error(`getCart: ${res.status}`);
  return res.json();
}

export async function removeFromCart(itemId: number): Promise<void> {
  const sessionId = cartSessionId();
  const res = await fetch(
    `${CHECKOUT_BASE}/api/v1/cart/items/${itemId}?session_id=${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`removeFromCart: ${res.status}`);
}

export async function clearCart(): Promise<void> {
  const sessionId = cartSessionId();
  const res = await fetch(
    `${CHECKOUT_BASE}/api/v1/cart?session_id=${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`clearCart: ${res.status}`);
}
