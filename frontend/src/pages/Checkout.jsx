import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkout, createPayment } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";
import { Empty, ErrorBox, Loading } from "../components/Status";

const METHODS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash on Delivery" },
];

function Checkout() {
  const { items, total, loading, refresh } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");

    try {
      // 1. turn the cart into an order
      const order = await checkout(address.trim());
      // 2. record how the customer will pay
      try {
        await createPayment(order.id, method);
      } catch {
        // the order exists already; the payment can be fixed later
      }
      await refresh(); // the cart is now empty
      navigate("/orders", { state: { placed: order.id } });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  if (loading) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Empty title="Nothing to check out">
          <Link to="/" className="btn">Browse products</Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-extrabold">Checkout</h1>

      <div className="grid gap-6 md:grid-cols-5">
        <form onSubmit={handleSubmit} className="card space-y-5 p-5 md:col-span-3">
          <div>
            <label htmlFor="address" className="label">Delivery address</label>
            <textarea
              id="address"
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
              placeholder="Street, town, any directions..."
            />
          </div>

          <fieldset>
            <legend className="label">Payment method</legend>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                    method === m.value ? "border-emerald-500 bg-emerald-50" : "border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <ErrorBox message={error} />

          <button className="btn w-full" disabled={placing}>
            {placing ? "Placing order..." : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="card h-fit p-5 md:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-stone-600">
                  {item.quantity} × {item.product.title}
                </span>
                <span className="font-medium">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
