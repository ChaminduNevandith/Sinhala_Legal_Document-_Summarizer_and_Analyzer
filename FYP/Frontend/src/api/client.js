import axios from "axios";

// Create an Axios instance with a base URL 
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// settings
const client = axios.create({
  baseURL,
  timeout: 12000000,
  withCredentials: true,
});

// Add a response interceptor to handle errors and extract error messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || "Request failed";
    return Promise.reject({ ...error, message });
  }
);

export default client;
