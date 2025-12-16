import axios from "axios";

const API_URL = "https://savings-server.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // include cookies/auth headers
});

// Attach token automatically if it exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
