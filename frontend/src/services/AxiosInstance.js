// import axios from 'axios';
// import { store } from '../store/store';

// const axiosInstance = axios.create({
//     baseURL: `https://react-course-b798e-default-rtdb.firebaseio.com/`,
// });

// axiosInstance.interceptors.request.use((config) => {
//     const state = store.getState();
//     const token = state.auth.auth.idToken;
//     config.params = config.params || {};
//     config.params['auth'] = token;
//     return config;
// });

// export default axiosInstance;


import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
});

// Har request se pehle token automatically lagao
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// 401 aaye toh auto logout
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;