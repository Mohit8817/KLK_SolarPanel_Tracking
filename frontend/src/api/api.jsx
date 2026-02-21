// src/api/api.jsx
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", 
  // baseURL: "http://klkventures.cloud/", 
  withCredentials: true,
});

export default API;
