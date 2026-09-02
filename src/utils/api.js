// src/utils/api.js
//
// Cookie-based auth: the browser automatically attaches the HttpOnly
// admin_session cookie when credentials: 'include' is set on a same-origin
// or properly-CORS-enabled request. No Bearer header is needed or used.

import { apiUrl } from "./apiBase";

const apiRequest = async (endpoint, options = {}) => {
  const url = apiUrl(endpoint);

  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const api = {
  auth: {
    login: (credentials) =>
      apiRequest("/user/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    logout: () =>
      apiRequest("/user/logout", {
        method: "POST",
      }),
    me: () => apiRequest("/user/me"),
  },
  posts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/posts${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id) => apiRequest(`/posts/${id}`),
    create: (postData) =>
      apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify(postData),
      }),
    update: (id, postData) =>
      apiRequest(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(postData),
      }),
    delete: (id) =>
      apiRequest(`/posts/${id}`, {
        method: "DELETE",
      }),
  },
};

export const apiUtils = {
  handleError: (error) => {
    console.error("API Error:", error);
    if (error.message === "Authentication required") {
      return "Please log in to continue";
    }
    return error.message || "An unexpected error occurred";
  },
  formatResponse: (response) => {
    if (response.success === false) {
      throw new Error(response.message || "Request failed");
    }
    return response.data || response;
  },
  retry: async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  },
};

export default api;