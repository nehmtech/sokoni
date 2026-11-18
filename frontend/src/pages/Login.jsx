import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/Status";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/"; // where to go after logging in

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-stone-500">Log in to your Sokoni account.</p>
        </div>

        <div>
          <label htmlFor="username" className="label">Username</label>
          <input
            id="username"
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <ErrorBox message={error} />

        <button className="btn w-full" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-stone-500">
          New here?{" "}
          <Link to="/register" state={{ from }} className="font-semibold text-emerald-700">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
