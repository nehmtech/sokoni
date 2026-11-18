import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBox } from "../components/Status";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // one handler for every input: uses the input's name to update the right field
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register({ ...form, username: form.username.trim() });
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
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-sm text-stone-500">Join Sokoni and start shopping.</p>
        </div>

        <div>
          <label htmlFor="username" className="label">Username</label>
          <input id="username" name="username" required autoFocus
            value={form.username} onChange={handleChange} className="input" />
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required
            value={form.email} onChange={handleChange} className="input" />
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone (optional)</label>
          <input id="phone" name="phone" type="tel"
            value={form.phone} onChange={handleChange} className="input" />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required minLength={6}
            value={form.password} onChange={handleChange} className="input" />
          <p className="mt-1 text-xs text-stone-500">At least 6 characters.</p>
        </div>

        <ErrorBox message={error} />

        <button className="btn w-full" disabled={busy}>
          {busy ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-stone-500">
          Already registered?{" "}
          <Link to="/login" state={{ from }} className="font-semibold text-emerald-700">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
