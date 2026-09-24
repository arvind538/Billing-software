// Frontend: src/lib/api.js

import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",

  // Backend cookies ke liye
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every API request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Unauthorized API request");

      // Token invalid/expired hone par local token remove
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    return Promise.reject(error);
  }
);

export default api;