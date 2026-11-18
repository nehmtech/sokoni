import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 sm:flex-row">
        <Link to="/" className="font-bold text-emerald-700">
          Sokoni
        </Link>
        <p>© {new Date().getFullYear()} Sokoni. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
