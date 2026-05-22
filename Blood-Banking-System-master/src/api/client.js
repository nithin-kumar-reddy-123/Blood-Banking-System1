import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export default api;
