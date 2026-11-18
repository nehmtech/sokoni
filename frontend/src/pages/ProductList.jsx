import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, getProducts } from "../api";
import { asList } from "../utils";
import ProductCard from "../components/ProductCard";
import { Empty, ErrorBox, Loading } from "../components/Status";

function ProductList() {
  // search and category live in the URL (?search=..&category=..) so the
  // page can be refreshed or shared and still show the same results.
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const page = Number(params.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);        // total products across ALL pages
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(asList(data)))
      .catch(() => {}); // filters are optional, ignore failures
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getProducts({ search, category, page })
      .then((data) => {
        if (cancelled) return;
        // paginated response: { count, next, previous, results }
        setProducts(asList(data));
        setTotal(data.count ?? 0);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true; // ignore results of an out-of-date request
    };
  }, [search, category, page]);

  // Changing search or category starts again from page 1;
  // the Previous/Next buttons pass their own page number.
  function update(next) {
    const merged = { search, category, page: 1, ...next };
    const clean = {};
    if (merged.search) clean.search = merged.search;
    if (merged.category) clean.category = merged.category;
    if (merged.page > 1) clean.page = merged.page;
    setParams(clean);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearch(e) {
    e.preventDefault();
    update({ search: searchText.trim() });
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* hero */}
      <section className="my-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Welcome to Sokoni</h1>
        <p className="mt-2 max-w-xl text-emerald-100">
          Discover products from local vendors, all in one marketplace.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search for a product..."
            className="input !border-transparent text-stone-800"
          />
          <button className="btn !bg-amber-500 hover:!bg-amber-600">Search</button>
        </form>
      </section>

      {/* category filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: "" })}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !category
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-stone-300 bg-white text-stone-600 hover:border-emerald-500"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ category: c.slug })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                category === c.slug
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-stone-300 bg-white text-stone-600 hover:border-emerald-500"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold">
        {search ? `Results for "${search}"` : "Products"}
        {!loading && !error && (
          <span className="ms-2 text-sm font-normal text-stone-500">({total})</span>
        )}
      </h2>

      {loading && <Loading text="Loading products..." />}
      <ErrorBox message={error} />

      {!loading && !error && products.length === 0 && (
        <Empty title="No products found">
          Try a different search or{" "}
          <button className="font-semibold text-emerald-600" onClick={() => setParams({})}>
            clear the filters
          </button>
          .
        </Empty>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* pagination controls */}
      {!loading && (hasPrev || hasNext) && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="btn-outline" disabled={!hasPrev} onClick={() => update({ page: page - 1 })}>
            ← Previous
          </button>
          <span className="text-sm font-medium text-stone-600">Page {page}</span>
          <button className="btn-outline" disabled={!hasNext} onClick={() => update({ page: page + 1 })}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;
