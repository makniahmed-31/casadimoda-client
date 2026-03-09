/**
 * Centralised fetch wrapper that routes all API calls to the Express backend.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export const apiFetch = (url: string, options: RequestInit = {}) => {
  let endpoint = url;
  if (endpoint.startsWith("/api")) {
    endpoint = endpoint.substring(4); // Remove starting /api
  }

  const fullUrl = `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  return fetch(fullUrl, {
    credentials: "include",
    ...options,
  });
};
