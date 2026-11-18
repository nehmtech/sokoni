import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";
import { Empty, ErrorBox, Loading } from "../components/Status";

function Cart() {
  const { user, ready } = useAuth();
  const { items, total, loading, remove } = useCart();
  const [error, setError] = useState("");

  async function handleRemove(id) {
    setError("");
    try {
      await remove(id);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready || loading) return <Loading />;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Empty title="Log in to see your cart">
          <Link to="/login" state={{ from: "/cart" }} className="btn">Log in</Link>
        </Empty>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Empty title="Your cart is empty">
          <Link to="/" className="btn">Start shopping</Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-extrabold">Your cart</h1>
      <ErrorBox message={error} />

      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <ul className="space-y-3 md:col-span-2">
          {items.map((item) => (
            <li key={item.id} className="card flex gap-4 p-3">
              <Link
                to={`/products/${item.product.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100"
              >
                {item.product.image ? (
                  <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-semibold hover:text-emerald-700"
                >
                  {item.product.title}
                </Link>
                <span className="text-sm text-stone-500">
                  {formatPrice(item.product.price)} × {item.quantity}
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit space-y-4 p-5">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="flex justify-between text-stone-600">
            <span>Items</span>
            <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link to="/checkout" className="btn w-full">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
