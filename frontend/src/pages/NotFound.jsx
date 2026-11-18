import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-emerald-600">404</p>
      <h1 className="mt-3 text-xl font-bold">Page not found</h1>
      <p className="mt-1 text-stone-500">The page you are looking for does not exist.</p>
      <Link to="/" className="btn mt-6">Back to the shop</Link>
    </div>
  );
}

export default NotFound;
