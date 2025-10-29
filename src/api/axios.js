// src/api/axios.js
import axios from "axios";

// Use unified API base (no trailing /auth)
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export default API;
