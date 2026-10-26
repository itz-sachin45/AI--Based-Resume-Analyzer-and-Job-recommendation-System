import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL });

// Attach bearer token to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("careerai-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 and surface a readable error.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Keep token removal centralized; AuthContext listens for it via the
      // logout helper. We avoid a hard redirect here so context can clean up.
      const onProtected = err.config?.url && !err.config.url.includes("/auth/");
      if (onProtected) {
        localStorage.removeItem("careerai-token");
        localStorage.removeItem("careerai-user");
      }
    }
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(typeof message === "string" ? message : "Request failed"));
  }
);

export default api;
