export const apiFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    credentials: "include",
    ...options,
  });
};
