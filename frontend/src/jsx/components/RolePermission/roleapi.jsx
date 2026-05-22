import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;

// ================= AUTH HEADER =================
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ================= GET ALL ROLES =================
export const getRoles = () =>
  axios.get(`${API}role/get-roles`, {
    headers: authHeader(),
  });

// ================= FETCH SINGLE ROLE =================
export const getRoleById = (id) =>
  axios.get(`${API}role/fetch-role/${id}`, {
    headers: authHeader(),
  });

// ================= CREATE ROLE =================
export const createRole = (data) =>
  axios.post(`${API}role/create`, data, {
    headers: authHeader(),
  });

// ================= UPDATE ROLE =================
export const updateRole = (id, data) =>
  axios.put(`${API}role/update-role/${id}`, data, {
    headers: authHeader(),
  });

// ================= DELETE ROLE =================
export const deleteRole = (id) =>
  axios.delete(`${API}role/delete-role/${id}`, {
    headers: authHeader(),
  });