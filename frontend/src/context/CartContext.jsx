import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const API = "http://localhost:3001/api";

export const CartProvider = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when logged in
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !token) { setItems([]); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!isLoggedIn) return { error: "Please log in to add items to cart." };
    try {
      const res = await fetch(`${API}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
      return data;
    } catch (err) {
      return { error: "Failed to add item." };
    }
  };

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    try {
      const res = await fetch(`${API}/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (err) {
      console.error("Update qty error:", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`${API}/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  const clearCart = async () => {
    try {
      await fetch(`${API}/cart`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQty, removeItem, clearCart, itemCount, subtotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
