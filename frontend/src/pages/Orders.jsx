import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrders } from "../api";
import { asList, formatPrice } from "../utils";
import { Empty, ErrorBox, Loading } from "../components/Status";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function Orders() {
  const location = useLocation();
  const placed = location.state?.placed; // set by Checkout after a successful order

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(asList(data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-extrabold">My orders</h1>

      {placed && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Thank you! Order #{placed} was placed successfully.
        </div>
      )}
      <ErrorBox message={error} />

      {!error && orders.length === 0 && (
        <Empty title="No orders yet">
          <Link to="/" className="btn">Start shopping</Link>
        </Empty>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="card overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3">
              <div>
                <h2 className="font-bold">Order #{order.id}</h2>
                <p className="text-xs text-stone-500">Deliver to: {order.address}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  STATUS_STYLES[order.status] ?? "bg-stone-100 text-stone-700"
                }`}
              >
                {order.status}
              </span>
            </header>

            <ul className="divide-y divide-stone-100 px-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.product_title ?? "Removed product"}</p>
                    <p className="text-xs text-stone-500">
                      {item.quantity} × {formatPrice(item.price)} · {item.vendor_name}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="flex justify-between border-t border-stone-200 px-4 py-3 font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Orders;
