"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCart, removeFromCart, clearCart, type Cart, type CartItem } from "@/lib/cart";
import { useCart } from "@/lib/CartContext";
import { cartSessionId } from "@/lib/cart";

const PAYMENT_URL = process.env.NEXT_PUBLIC_PAYMENT_URL ?? "http://localhost:8090";

interface PaymentResult {
  order_ref: string;
  card_brand: string;
  card_last4: string;
  amount: number;
}

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CartPage() {
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);

  // Form state
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  async function loadCart() {
    try {
      const c = await getCart();
      setCart(c);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  async function handleRemove(itemId: number) {
    setRemoving(itemId);
    try {
      await removeFromCart(itemId);
      await loadCart();
      await refresh();
    } finally {
      setRemoving(null);
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setPaymentError("");
    setPaying(true);

    const [month, year] = expiry.split("/");
    const rawCard = cardNumber.replace(/\s/g, "");

    try {
      const res = await fetch(`${PAYMENT_URL}/api/v1/payments/authorise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: cartSessionId(),
          amount: (cart?.subtotal ?? 0) * 1.1,
          currency: "USD",
          card_number: rawCard,
          expiry_month: month,
          expiry_year: year,
          cvv,
          name_on_card: nameOnCard,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setPaymentError(data.message ?? "Payment declined");
        return;
      }

      // Clear cart on success
      await clearCart().catch(() => {});
      await refresh();

      setPaymentResult({
        order_ref: data.payment.order_ref,
        card_brand: data.payment.card_brand,
        card_last4: data.payment.card_last4,
        amount: data.payment.amount,
      });
    } catch {
      setPaymentError("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  const items: CartItem[] = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const subtotal = cart?.subtotal ?? 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10">
        <nav className="flex items-center gap-1.5 mb-8 text-[11px] tracking-wide">
          <Link href="/" className="text-nordstrom-gray-700 hover:text-nordstrom-black">Home</Link>
          <span className="text-nordstrom-gray-300">/</span>
          <span className="text-nordstrom-gray-500">
            {paymentResult ? "Order Confirmation" : "Shopping Bag"}
          </span>
        </nav>

        {/* ── Order confirmed ───────────────────────────────────────── */}
        {paymentResult ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-5">
            <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-light text-nordstrom-black mb-1">Order confirmed</h1>
              <p className="text-sm text-nordstrom-gray-500">Thank you for your purchase.</p>
            </div>
            <div className="bg-nordstrom-gray-50 border border-nordstrom-gray-200 p-5 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-nordstrom-gray-500">Order reference</span>
                <span className="font-medium text-nordstrom-black">{paymentResult.order_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nordstrom-gray-500">Payment</span>
                <span className="font-medium text-nordstrom-black">
                  {paymentResult.card_brand} •••• {paymentResult.card_last4}
                </span>
              </div>
              <div className="flex justify-between border-t border-nordstrom-gray-200 pt-2 mt-2">
                <span className="text-nordstrom-gray-500">Total charged</span>
                <span className="font-medium text-nordstrom-black">${paymentResult.amount.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/gifts" className="inline-block text-xs tracking-widest uppercase underline text-nordstrom-black hover:text-nordstrom-gray-700">
              Continue Shopping
            </Link>
          </div>

        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-5 py-6 border-b border-nordstrom-gray-100">
                <div className="w-24 h-28 bg-nordstrom-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-nordstrom-gray-100 w-1/4" />
                  <div className="h-4 bg-nordstrom-gray-100 w-1/2" />
                </div>
              </div>
            ))}
          </div>

        ) : isEmpty ? (
          <div className="text-center py-20 space-y-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" className="mx-auto">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-nordstrom-gray-500 text-sm">Your bag is empty.</p>
            <Link href="/gifts" className="inline-block text-xs tracking-widest uppercase underline text-nordstrom-black">
              Start Shopping
            </Link>
          </div>

        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Item list ──────────────────────────────────────────── */}
            <div className="flex-1">
              <h1 className="text-2xl font-light tracking-tight text-nordstrom-black mb-6">
                Shopping Bag
                <span className="text-sm font-normal text-nordstrom-gray-500 ml-3">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </h1>

              <div className="divide-y divide-nordstrom-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 py-6">
                    {item.image_url ? (
                      <Link href={`/product?style_id=${item.style_id}`} className="shrink-0">
                        <Image src={item.image_url} alt={item.name} width={96} height={112}
                          className="w-24 h-28 object-cover bg-nordstrom-gray-50" />
                      </Link>
                    ) : (
                      <div className="w-24 h-28 bg-nordstrom-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="text-[10px] tracking-[0.15em] uppercase text-nordstrom-gray-500">{item.brand}</p>
                      <Link href={`/product?style_id=${item.style_id}`}
                        className="text-sm font-medium text-nordstrom-black hover:underline line-clamp-2 leading-snug">
                        {item.name}
                      </Link>
                      {(item.size || item.color_name) && (
                        <p className="text-xs text-nordstrom-gray-500 mt-0.5">
                          {[item.color_name, item.size && `Size ${item.size}`].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <p className="text-sm font-medium text-nordstrom-black">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                          {item.quantity > 1 && (
                            <span className="text-xs font-normal text-nordstrom-gray-500 ml-1">
                              (${item.unit_price.toFixed(2)} × {item.quantity})
                            </span>
                          )}
                        </p>
                        <button onClick={() => handleRemove(item.id)} disabled={removing === item.id}
                          className="text-xs text-nordstrom-gray-400 hover:text-nordstrom-black underline transition-colors disabled:opacity-40">
                          {removing === item.id ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column: summary + payment ────────────────────── */}
            <div className="lg:w-80 shrink-0 space-y-5">
              {/* Order summary */}
              <div className="border border-nordstrom-gray-200 p-6 space-y-4">
                <h2 className="text-sm font-medium tracking-wide text-nordstrom-black uppercase">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-nordstrom-gray-700">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-nordstrom-gray-700">
                    <span>Shipping</span>
                    <span className="text-green-700">Free</span>
                  </div>
                  <div className="flex justify-between text-nordstrom-gray-700">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-nordstrom-gray-200 pt-3 flex justify-between text-sm font-medium text-nordstrom-black">
                  <span>Estimated Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {!showPaymentForm && (
                  <button onClick={() => setShowPaymentForm(true)}
                    className="w-full bg-nordstrom-black text-white py-3.5 text-xs tracking-widest uppercase font-medium hover:bg-nordstrom-gray-700 transition-colors">
                    Proceed to Payment
                  </button>
                )}
              </div>

              {/* Payment form */}
              {showPaymentForm && (
                <form onSubmit={handlePay} className="border border-nordstrom-gray-200 p-6 space-y-4">
                  <h2 className="text-sm font-medium tracking-wide text-nordstrom-black uppercase">Payment Details</h2>

                  <p className="text-[11px] text-nordstrom-gray-400 bg-nordstrom-gray-50 border border-nordstrom-gray-200 px-3 py-2">
                    Test: use any card number. To simulate a decline, use a card ending in <strong>0000</strong>.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] tracking-wide uppercase text-nordstrom-gray-500 mb-1">Name on card</label>
                      <input type="text" required value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full border border-nordstrom-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-nordstrom-black transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-wide uppercase text-nordstrom-gray-500 mb-1">Card number</label>
                      <input type="text" required inputMode="numeric" value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        placeholder="4111 1111 1111 1111" maxLength={19}
                        className="w-full border border-nordstrom-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-nordstrom-black transition-colors font-mono" />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] tracking-wide uppercase text-nordstrom-gray-500 mb-1">Expiry</label>
                        <input type="text" required inputMode="numeric" value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY" maxLength={5}
                          className="w-full border border-nordstrom-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-nordstrom-black transition-colors font-mono" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] tracking-wide uppercase text-nordstrom-gray-500 mb-1">CVV</label>
                        <input type="text" required inputMode="numeric" value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123" maxLength={4}
                          className="w-full border border-nordstrom-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-nordstrom-black transition-colors font-mono" />
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{paymentError}</p>
                  )}

                  <button type="submit" disabled={paying}
                    className="w-full bg-nordstrom-black text-white py-3.5 text-xs tracking-widest uppercase font-medium hover:bg-nordstrom-gray-700 disabled:opacity-50 transition-colors">
                    {paying ? "Processing…" : `Pay $${total.toFixed(2)}`}
                  </button>

                  <button type="button" onClick={() => { setShowPaymentForm(false); setPaymentError(""); }}
                    className="w-full text-center text-xs tracking-widest uppercase text-nordstrom-gray-400 hover:text-nordstrom-black underline transition-colors">
                    Back to bag
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    {["Visa", "MC", "Amex"].map((b) => (
                      <span key={b} className="text-[10px] text-nordstrom-gray-400 border border-nordstrom-gray-200 px-2 py-0.5">{b}</span>
                    ))}
                  </div>
                </form>
              )}

              <Link href="/gifts"
                className="block text-center text-xs tracking-widest uppercase underline text-nordstrom-gray-500 hover:text-nordstrom-black transition-colors">
                Continue Shopping
              </Link>

              <div className="space-y-1.5 text-[11px] text-nordstrom-gray-500">
                <p className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Free shipping & returns on every order
                </p>
                <p className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
