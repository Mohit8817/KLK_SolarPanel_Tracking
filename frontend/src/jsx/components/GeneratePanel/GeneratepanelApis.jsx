import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

// Token helper
const getToken = () => {
  return localStorage.getItem("token");
};

// User helper
const getUser = () => {
  return JSON.parse(localStorage.getItem("user") || "{}");
};



// ================= CREATE PANEL SERIAL =================
export const createPanelSerial = async (formData) => {
  const user = getUser();
  const token = getToken();

  const payload = {
    ...formData,
    company_id: user.company_id,
    created_by: user.id,
    updated_by: user.id,
  };

  return axios.post(
    `${BASE_URL}panels/create-panel-serial`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};



// ================= GET ALL PANEL LOTS =================
export const getAllPanelLots = async () => {
  const token = getToken();

  return axios.get(
    `${BASE_URL}panels/all-panel-serial`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// ================= DELETE PANEL LOT =================
export const deletePanelLot = async (id) => {
  const token = getToken();

  return axios.delete(
    `${BASE_URL}panels/delete-panel-serial/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


// ================= GET PANEL DETAILS =================
export const getPanelDetailsByLot = async (id) => {
  const token = getToken();

  return axios.get(
    `${BASE_URL}panels/allpanels/lot/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
