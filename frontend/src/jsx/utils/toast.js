import { toast } from "react-toastify";

const defaults = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

export const notifySuccess = (message) =>
  toast.success(message, defaults);

export const notifyError = (message) =>
  toast.error(message || "Something went wrong", defaults);

export const notifyWarning = (message) =>
  toast.warning(message, defaults);

export const notifyInfo = (message) =>
  toast.info(message, defaults);
