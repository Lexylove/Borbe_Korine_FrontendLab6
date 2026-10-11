import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const STORAGE_KEY = "pms_auth";

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth?.tokens?.access_token) {
    config.headers.Authorization = `Bearer ${auth.tokens.access_token}`;
  }
  return config;
});

// On 401 -> try the refresh token once, then retry the request; otherwise log out
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const auth = loadAuth();

    const isAuthCall = original?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && auth?.tokens?.refresh_token && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: auth.tokens.refresh_token });
        const { data } = await refreshing;
        refreshing = null;
        saveAuth({ ...auth, tokens: data.tokens });
        original.headers.Authorization = `Bearer ${data.tokens.access_token}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        clearAuth();
        window.dispatchEvent(new Event("pms:logout"));
      }
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);

export const logout = () => {
  const auth = loadAuth();
  return api.post("/auth/logout", { refresh_token: auth?.tokens?.refresh_token }).catch(() => {});
};

export const getProducts = (search = "") =>
  api.get("/products", { params: search ? { search } : {} }).then((r) => r.data);
export const createProduct = (p) => api.post("/products", p).then((r) => r.data);
export const updateProduct = (id, p) => api.put(`/products/${id}`, p).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

/** Turn an axios error into a readable message */
export function errorMessage(err) {
  const d = err?.response?.data;
  if (d?.errors) return Object.values(d.errors).join(" ");
  if (d?.error) return d.error;
  if (err?.message === "Network Error") return "Cannot reach the API. Check VITE_API_URL / CORS.";
  return err?.message || "Something went wrong.";
}
