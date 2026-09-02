// src/utils/apiBase.js
//
// Builds an absolute or same-origin backend URL.
// VITE_API_BASE_URL should be the origin only (e.g. http://localhost:5000).
// If it accidentally ends with /api or /api/, we strip it so apiUrl() can
// safely append /api<path>.
//
// Usage:
//   fetch(apiUrl('/user/login'), { credentials: 'include', ... })

export const apiUrl = (path) => {
  let base = import.meta.env.VITE_API_BASE_URL || "";
  base = base.replace(/\/api\/?$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${normalizedPath}`;
};