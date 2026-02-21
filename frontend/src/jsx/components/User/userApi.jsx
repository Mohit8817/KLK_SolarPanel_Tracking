import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

//  Get all users
export const getUsers = () =>
  axios.get(`${API}users/user-list`, { headers: authHeader() });

// Get single user
export const getUserById = (id) =>
  axios.get(`${API}users/fetch-user/${id}`, { headers: authHeader() });

//  Create user
export const createUser = (data) =>
  axios.post(`${API}users/create-user`, data, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data"
    }
  });

//  Update user
export const updateUser = (id, data) =>
  axios.put(`${API}users/update-user/${id}`, data, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data"
    }
  });

// 🗑 Delete user
export const deleteUser = (id) =>
  axios.get(`${API}users/delete-user/${id}`, {
    headers: authHeader()
  });
