import axios from "axios";

/**
 * API base URL
 * - Uses Netlify env in production
 * - Falls back to Render URL
 * - Localhost only for local backend testing
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://timarni-qr-backend.onrender.com";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

/* ===== ADMIN DASHBOARD ===== */

// Fetch all activated households
export const fetchHouseholds = () => API.get("/admin/households");

// Update revenue fields
export const updateHousehold = (id, payload) =>
  API.put(`/admin/households/${id}`, payload);

/* ===== AUTH ===== */

// Admin login
export const loginAdmin = (credentials) =>
  API.post("/auth/login", credentials);

