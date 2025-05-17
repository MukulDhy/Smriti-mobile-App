import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import API_BASE_URL from "../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Add request interceptor to include token
api.interceptors.request.use(
  async (config) => {
    console.log(useAuth);
    // const { userToken } = useAuth.getState();
    const userToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjFiNDdiNmNhNjU4Y2QwMTY3MTU0OSIsImlhdCI6MTc0NzA3NjQ0OCwiZXhwIjoxNzQ5NjY4NDQ4fQ.k8RV5eMXLpbu97Cq2KhP7cAzvLS5BO1j9ozZmb9TCoo";
      
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout)
    }
    return Promise.reject(error);
  }
);

export default api;
