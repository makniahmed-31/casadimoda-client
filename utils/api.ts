/**
 * Centralised fetch wrapper that routes all API calls to the Express backend.
 * The base URL is taken from NEXT_PUBLIC_API_URL (defaults to http://localhost:5000/api).
 */
export const apiFetch = (url: string, options: RequestInit = {}) => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  
  if (url.startsWith("/api")) {
    url = url.substring(4); // Remove starting /api
  }

  const fullUrl = `${base}${url.startsWith("/") ? "" : "/"}${url}`;

  return fetch(fullUrl, {
    credentials: "include",
    ...options,
  });
};
