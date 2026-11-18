import { Link } from "react-router-dom";
import { formatPrice } from "../utils";

function ProductCard({ product }) {
  const soldOut = product.stock === 0;


  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            No image
          </div>
        )}
        {soldOut  && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-800 px-2.5 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category_name && (
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {product.category_name}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold text-stone-800">{product.title}</h3>
        <p className="text-xs text-stone-500">by {product.vendor_name}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-stone-900">{formatPrice(product.price)}</span>
          {!soldOut && product.stock <= 5 && (
            <span className="text-xs font-medium text-amber-600">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
