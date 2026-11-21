import axios from "axios";

const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/+$/, "");

const BASE_API_URL = rawBackendUrl
  ? `${rawBackendUrl}/api`
  : import.meta.env.MODE === "development"
  ? "http://localhost:5001/api"
  : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});