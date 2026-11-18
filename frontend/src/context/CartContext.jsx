import { createContext, useContext, useEffect, useState } from "react";
import { addToCart, getCart, removeCartItem } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      const cart = await getCart();
      setItems(cart.items);
    } catch {
      setItems([]);
    }
  }

  // Load the cart when someone logs in, empty it when they log out.
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user]);

  async function add(productId, quantity = 1) {
    await addToCart(productId, quantity);
    await refresh();
  }

  async function remove(itemId) {
    await removeCartItem(itemId);
    await refresh();
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider value={{ items, count, total, loading, add, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
