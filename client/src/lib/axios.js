import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_MODE === "development"
    ? `http://localhost:5001/api/users`
    : "/api/users";

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
