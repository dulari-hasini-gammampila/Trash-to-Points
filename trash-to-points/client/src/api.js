/**
 * Here's what this is for:
 * Small helpers that call the backend for you—same web address everywhere, attach the login token,
 * and handle photo uploads without repeating the same code on every page.
 *
 * How it fits in:
 * Any screen that saves data or loads lists from the server imports this file.
 *
 * Why it matters:
 * One place to fix if the server URL changes or login stops working for everyone at once.
 */
const RAW = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export const API_PREFIX = RAW ? `${RAW}/api` : "/api";

/** Base URL for uploaded images (/uploads/...) in production */
export function apiOrigin() {
  return RAW || "";
}

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiOrigin()}${path}`;
}

export function getToken() {
  return localStorage.getItem("ttp_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("ttp_token", token);
  else localStorage.removeItem("ttp_token");
}

export async function api(path, options = {}) {
  const { body, ...rest } = options;
  const headers = {
    "Content-Type": "application/json",
    ...rest.headers,
  };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const url = path.startsWith("http") ? path : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Start the backend (folder server: npm run dev, port 3001) and open this site with the Vite dev server (folder client: npm run dev) at http://localhost:8000 — do not open HTML files directly from disk."
    );
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Multipart upload — do not set Content-Type (browser adds boundary). */
export async function apiUpload(path, formData, options = {}) {
  const headers = { ...options.headers };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  delete headers["Content-Type"];

  const url = path.startsWith("http") ? path : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      method: options.method || "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Is the server running on port 3001? Use npm run dev in client/ and open http://localhost:8000"
    );
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
