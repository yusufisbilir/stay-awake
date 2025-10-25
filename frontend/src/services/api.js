/**
 * API Service
 * Axios configuration for backend communication
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Error from backend
      throw new Error(error.response.data.message || "An error occurred");
    } else if (error.request) {
      // Request sent but no response received
      throw new Error("Cannot reach server");
    } else {
      // Error while creating request
      throw new Error("Request error: " + error.message);
    }
  }
);

// API functions
export const createUrl = async (url) => {
  const response = await api.post("/urls", { url });
  return response.data;
};

export const searchDomain = async (domain) => {
  const response = await api.get("/domains/search", {
    params: { q: domain },
  });
  return response.data;
};

export const getAllUrls = async () => {
  const response = await api.get("/urls");
  return response.data;
};

export const deleteUrl = async (id) => {
  const response = await api.delete(`/urls/${id}`);
  return response.data;
};

export const getUrlHistory = async (id, days = 7) => {
  const response = await api.get(`/urls/${id}/history`, {
    params: { days },
  });
  return response.data;
};

export default api;
