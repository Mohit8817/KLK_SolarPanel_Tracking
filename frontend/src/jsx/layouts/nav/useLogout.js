import axios from "axios";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("userDetails");

    // Remove axios auth header
    delete axios.defaults.headers.common["Authorization"];

    // Redirect
    navigate("/login", { replace: true });
  };

  return logout;
};

export default useLogout;
