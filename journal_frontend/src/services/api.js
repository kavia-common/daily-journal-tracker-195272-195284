/**
 * Minimal API client for the journal backend.
 * Uses REACT_APP_API_BASE_URL if provided, otherwise defaults to localhost:3001.
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

/** Resolve API base URL with a robust fallback. */
function getApiBaseUrl() {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return DEFAULT_BASE_URL;
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Normalize backend error responses into a friendly Error.
 * Supports JSON {detail, message} and plain text.
 */
async function toHttpError(response) {
  let message = `Request failed (${response.status})`;
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } else {
      const text = await response.text();
      if (text) message = text;
    }
  } catch {
    // ignore parse errors; keep default message
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw await toHttpError(response);
  }

  // Some endpoints may respond with 204 or empty body.
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

// PUBLIC_INTERFACE
export async function getStreak() {
  /** Get current streak count. */
  return request("/streak", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getTodayEntry() {
  /** Get today's entry (if any). */
  return request("/entries/today", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function submitEntry(content) {
  /** Submit today's entry; backend should enforce one per day. */
  return request("/entries", {
    method: "POST",
    body: JSON.stringify({ content })
  });
}

// PUBLIC_INTERFACE
export async function listEntries() {
  /** List past entries (history). */
  return request("/entries", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getEntryById(entryId) {
  /** Fetch a single entry by ID. */
  return request(`/entries/${encodeURIComponent(entryId)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export function getApiInfo() {
  /** Returns API info useful for debugging (e.g., base URL). */
  return { baseUrl: API_BASE_URL };
}
