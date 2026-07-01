"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  id: string; slug: string; name: string;
  priceInPaise: number; currency: string;
  imageUrl?: string | null; size?: string; quantity: number;
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size?: string) => void;
  updateQty: (id: string, size: string | undefined, qty: number) => void;
  clearCart: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  totalItems: number;
  totalPrice: number;
  toast: string | null;
}

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

const KEY = "trendora_cart";

function key(id: string, size?: string) { return `${id}__${size ?? ""}` ; }

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const k = key(item.id, item.size);
      const existing = prev.find((i) => key(i.id, i.size) === k);
      if (existing) return prev.map((i) => key(i.id, i.size) === k ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`${item.name} added to cart!`);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id: string, size?: string) => {
    setItems((prev) => prev.filter((i) => key(i.id, i.size) !== key(id, size)));
  }, []);

  const updateQty = useCallback((id: string, size: string | undefined, qty: number) => {
    if (qty <= 0) { removeItem(id, size); return; }
    setItems((prev) => prev.map((i) => key(i.id, i.size) === key(id, size) ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.priceInPaise * i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, addItem, removeItem, updateQty, clearCart, drawerOpen, setDrawerOpen, totalItems, totalPrice, toast }}>
      {children}
      {toast && (
        <div className="animate-toast" style={{
          position:"fixed", bottom:"1.5rem", left:"50%", transform:"translateX(-50%)",
          background:"#111827", color:"#fff", padding:"0.75rem 1.25rem",
          borderRadius:"var(--radius)", boxShadow:"var(--shadow-lg)",
          zIndex:9999, fontSize:"0.9rem", fontWeight:500, whiteSpace:"nowrap",
          display:"flex", alignItems:"center", gap:"0.5rem"
        }}>
          <span>🛒</span> {toast}
        </div>
      )}
    </Ctx.Provider>
  );
}
