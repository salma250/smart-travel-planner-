// front/services/api.js
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "wandr_token";
const USER_KEY = "wandr_user";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export function normalizeDestination(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
}

export function destinationKey(value = "") {
  return normalizeDestination(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function normalizeError(err) {
  const data = err.response?.data;
  if (typeof data?.detail === "string") return new Error(data.detail);
  if (Array.isArray(data?.detail)) return new Error(data.detail[0]?.msg || "Request failed");
  if (data?.message) return new Error(data.message);
  return new Error(err.message || "Request failed");
}

export async function checkHealth() {
  const resp = await api.get("/health");
  return resp.data;
}

export async function checkDbHealth() {
  const resp = await api.get("/api/health/db");
  return resp.data;
}

export async function login(email, password) {
  try {
    const resp = await api.post("/api/auth/login", { email, password });
    const data = resp.data;
    const token = data.access_token || data.token;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function register(name, email, password) {
  try {
    const resp = await api.post("/api/auth/register", { name, email, password });
    const data = resp.data;
    const token = data.access_token || data.token;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getCities() {
  try {
    const resp = await api.get("/api/cities/");
    return resp.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function sendMultimodalMessage(text, { audioFile = null, imageFile = null } = {}) {
  try {
    const form = new FormData();
    if (text !== undefined && text !== null) form.append("text", text);
    if (audioFile) form.append("audio", audioFile);
    if (imageFile) form.append("image", imageFile);

    const resp = await api.post("/api/chat/message-with-attachments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTrips() {
  try {
    const resp = await api.get("/api/trips/");
    return resp.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function generateTravelPlan({ destination, budget, days, travelers, styles = [] }) {
  try {
    const normalizedDestination = normalizeDestination(destination);
    if (!normalizedDestination) {
      throw new Error("Destination is required");
    }
    const resp = await api.post("/api/travel/plan", {
      destination: normalizedDestination,
      budget: Number(budget),
      days: Number(days),
      travelers: Number(travelers),
      styles,
    });
    const data = resp.data;
    if (destinationKey(data?.destination?.city) !== destinationKey(normalizedDestination)) {
      throw new Error(`Destination mismatch: requested ${normalizedDestination}, received ${data?.destination?.city || "unknown"}`);
    }
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    // ignore
  }
}

export default api;
