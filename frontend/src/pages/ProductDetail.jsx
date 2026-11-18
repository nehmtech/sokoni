import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createReview, getProduct, getReviews } from "../api";
import { asList, formatPrice } from "../utils";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Stars from "../components/Stars";
import { ErrorBox, Loading } from "../components/Status";

function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const data = await getProduct(slug);
        if (cancelled) return;
        setProduct(data);
        setQuantity(1);
        const list = await getReviews(data.id);
        if (!cancelled) setReviews(asList(list));
      } catch (err) {
        if (!cancelled) {
          setError(err.status === 404 ? "This product could not be found." : err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setAdding(true);
    setMessage("");
    setCartError("");
    try {
      await add(product.id, quantity);
      setMessage("Added to your cart!");
    } catch (err) {
      setCartError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleReview(e) {
    e.preventDefault();
    setSending(true);
    setReviewError("");
    try {
      const created = await createReview(product.id, rating, comment.trim());
      setReviews([created, ...reviews]);
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <ErrorBox message={error} />
        <Link to="/" className="btn-outline">← Back to products</Link>
      </div>
    );
  }

  const soldOut = product.stock === 0;
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Back to products
      </Link>

      <div className="card mt-4 grid gap-8 p-4 sm:p-6 md:grid-cols-2">
        {/* image */}
        <div className="aspect-square overflow-hidden rounded-xl bg-stone-100">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">No image</div>
          )}
        </div>

        {/* info */}
        <div className="flex flex-col">
          {product.category_name && (
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {product.category_name}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-extrabold">{product.title}</h1>
          <p className="mt-1 text-sm text-stone-500">Sold by {product.vendor_name}</p>

          <div className="mt-3 flex items-center gap-2">
            <Stars value={average} />
            <span className="text-sm text-stone-500">
              {reviews.length ? `${average.toFixed(1)} (${reviews.length})` : "No reviews yet"}
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold">{formatPrice(product.price)}</p>

          <p className="mt-4 whitespace-pre-line text-stone-600">
            {product.description || "No description provided."}
          </p>

          <p className={`mt-4 text-sm font-semibold ${soldOut ? "text-red-600" : "text-emerald-700"}`}>
            {soldOut ? "Out of stock" : `${product.stock} in stock`}
          </p>

          {!soldOut && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-stone-300 bg-white">
                <button
                  className="px-3 py-2 text-lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  className="px-3 py-2 text-lg"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button onClick={handleAdd} disabled={adding} className="btn flex-1 sm:flex-none">
                {adding ? "Adding..." : "Add to cart"}
              </button>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <ErrorBox message={cartError} />
            {message && (
              <p className="text-sm font-medium text-emerald-700">
                {message}{" "}
                <Link to="/cart" className="underline">View cart</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* reviews */}
      <section className="mt-10 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <h2 className="mb-4 text-xl font-bold">Customer reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-stone-500">Be the first to review this product.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.username}</span>
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-stone-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          <h2 className="mb-4 text-xl font-bold">Write a review</h2>
          {user ? (
            <form onSubmit={handleReview} className="card space-y-4 p-4">
              <div>
                <span className="label">Your rating</span>
                <Stars value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="label" htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input"
                  placeholder="What did you think?"
                />
              </div>
              <ErrorBox message={reviewError} />
              <button className="btn w-full" disabled={sending}>
                {sending ? "Sending..." : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="card p-4 text-sm text-stone-600">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="font-semibold text-emerald-700 underline"
              >
                Log in
              </Link>{" "}
              to write a review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;
