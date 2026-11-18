import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:text-emerald-700"
    }`;

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-emerald-700">
          Sokoni
        </Link>

        <button
          className="rounded-md p-2 text-stone-600 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>

        <nav
          onClick={() => setOpen(false)}
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col gap-1 border-b border-stone-200 bg-white p-4 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          <NavLink to="/" end className={linkClass}>Shop</NavLink>

          {user && <NavLink to="/orders" className={linkClass}>My orders</NavLink>}

          <NavLink to="/cart" className={linkClass}>
            Cart
            {count > 0 && (
              <span className="ms-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>

          {user ? (
            <div className="flex items-center gap-3 md:ms-3">
              <span className="text-sm text-stone-500">Hi, {user.username}</span>
              <button onClick={handleLogout} className="btn-outline !py-1.5">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:ms-3">
              <Link to="/login" className="btn-outline !py-1.5">Log in</Link>
              <Link to="/register" className="btn !py-1.5">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
