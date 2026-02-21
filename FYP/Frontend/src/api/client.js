import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL,
  // Increase timeout to allow for OCR + model summarization on large PDFs.
  // 120000ms = 2 minutes; adjust down later if needed.
  timeout: 120000,
  withCredentials: true,
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
