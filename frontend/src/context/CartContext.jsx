import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const API = "http://localhost:3001/api";

// Helper to extract the raw ObjectId string from a product field
// which may be a populated object {_id, name, ...} or a plain ObjectId string
const getProductId = (product) => {
  if (!product) return "";
  if (typeof product === "string") return product;
  if (product._id) return product._id.toString();
  return product.toString();
};

export const CartProvider = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!isLoggedIn) return { error: "Please log in to add items to cart." };
    try {
      const res = await fetch(`${API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: productId.toString(), quantity }),
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
      return data;
    } catch (err) {
      return { error: "Failed to add item." };
    }
  };

  const updateQty = async (productOrId, quantity) => {
    const productId = getProductId(productOrId);
    if (quantity < 1) return removeItem(productId);
    try {
      const res = await fetch(`${API}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (err) {
      console.error("Update qty error:", err);
    }
  };

  const removeItem = async (productOrId) => {
    const productId = getProductId(productOrId);
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
      await fetch(`${API}/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
