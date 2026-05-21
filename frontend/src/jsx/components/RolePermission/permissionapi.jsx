import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;

// ================= AUTH HEADER =================
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ================= GET ALL PERMISSIONS =================
export const getPermissions = () =>
  axios.get(
    `${API}role/permissions`,
    {
      headers: authHeader(),
    }
  );

// ================= FETCH SINGLE PERMISSION =================
export const getPermissionById = (id) =>
  axios.get(
    `${API}role/permission/${id}`,
    {
      headers: authHeader(),
    }
  );

// ================= CREATE PERMISSION =================
export const createPermission = (data) =>
  axios.post(
    `${API}role/permission/create`,
    data,
    {
      headers: authHeader(),
    }
  );

// ================= UPDATE PERMISSION =================
export const updatePermission = (id, data) =>
  axios.put(
    `${API}role/permission/update/${id}`,
    data,
    {
      headers: authHeader(),
    }
  );

// ================= DELETE PERMISSION =================
export const deletePermission = (id) =>
  axios.delete(
    `${API}role/permission/delete/${id}`,
    {
      headers: authHeader(),
    }
  );