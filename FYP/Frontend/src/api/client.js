import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL,
  timeout: 10000,
  // If your backend sets cookies/auth: enable below
  // withCredentials: true,
});

// Optional: response interceptor to normalize error messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || "Request failed";
    return Promise.reject({ ...error, message });
  }
);

export default client;
