"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCart, addToCart, removeFromCart, type Cart } from "./cart";

interface CartContextValue {
  cartCount: number;
  subtotal: number;
  addItem: (productId: number, quantity?: number, unitPrice?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  subtotal: 0,
  addItem: async () => {},
  removeItem: async () => {},
  refresh: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  const refresh = useCallback(async () => {
    try {
      const c = await getCart();
      setCart(c);
    } catch {
      // cart service unavailable — silent
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productId: number, quantity = 1, unitPrice = 0) => {
    await addToCart(productId, quantity, unitPrice);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (itemId: number) => {
    await removeFromCart(itemId);
    await refresh();
  }, [refresh]);

  return (
    <CartContext.Provider value={{
      cartCount: cart?.item_count ?? 0,
      subtotal: cart?.subtotal ?? 0,
      addItem,
      removeItem,
      refresh,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
