// All talking to the Django backend happens in this file.
// Components never call fetch() directly - they call the functions below.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const AUTH_KEY = "sokoni_auth";

/* ---------- login token ----------
   The backend uses DRF Token authentication. Logging in returns a token;
   we keep it in localStorage and send it on every request as
   "Authorization: Token <key>". */
export function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearCredentials() {
  localStorage.removeItem(AUTH_KEY);
}

export function hasCredentials() {
  return Boolean(localStorage.getItem(AUTH_KEY));
}

/* ---------- one helper that every call goes through ---------- */
function errorMessage(data, status) {
  if (!data) return `Something went wrong (${status}).`;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(" ");
  if (data.detail) return data.detail;

  // field errors look like { username: ["already taken"], ... }
  return Object.entries(data)
    .map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
      return field === "non_field_errors" ? text : `${field}: ${text}`;
    })
    .join("  ");
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = localStorage.getItem(AUTH_KEY);
  if (token) headers.Authorization = `Token ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  // 204 = success with nothing to return (e.g. DELETE)
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // body was empty or not JSON
  }

  if (!response.ok) {
    const error = new Error(errorMessage(data, response.status));
    error.status = response.status;
    throw error;
  }
  return data;
}

/* ---------- auth ---------- */
export const registerUser = (data) =>
  request("/auth/register/", { method: "POST", body: data });

// POST /api/auth/login/ -> { token: "..." }
export const loginUser = (username, password) =>
  request("/auth/login/", { method: "POST", body: { username, password } });

export const getMe = () => request("/auth/me/");

/* ---------- shop ---------- */
// Returns { count, next, previous, results } because the backend is paginated.
export function getProducts({ search = "", category = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", page);
  const query = params.toString();
  return request(`/products/${query ? `?${query}` : ""}`);
}

export const getProduct = (slug) => request(`/products/${slug}/`);
export const getCategories = () => request("/categories/");

/* ---------- cart ---------- */
export const getCart = () => request("/cart/");

export const addToCart = (productId, quantity = 1) =>
  request("/cart/add/", {
    method: "POST",
    body: { product_id: productId, quantity },
  });

export const removeCartItem = (itemId) =>
  request(`/cart/items/${itemId}/`, { method: "DELETE" });

/* ---------- orders and payments ---------- */
export const checkout = (address) =>
  request("/orders/checkout/", { method: "POST", body: { address } });

export const getOrders = () => request("/orders/");

export const createPayment = (orderId, method) =>
  request("/payments/", { method: "POST", body: { order: orderId, method } });

/* ---------- reviews ---------- */
export const getReviews = (productId) => request(`/reviews/?product=${productId}`);

export const createReview = (productId, rating, comment) =>
  request("/reviews/", {
    method: "POST",
    body: { product: productId, rating, comment },
  });
