// src/utils/toastNotifications.js
import { toast } from "react-toastify";

export const showSuccessToast = (message) => {
  toast.success(message, {
    // position: "top-right", // Can be set here or globally in ToastContainer
    // autoClose: 3000,
    // hideProgressBar: false,
    // closeOnClick: true,
    // pauseOnHover: true,
    // draggable: true,
    // progress: undefined,
    // theme: "colored",
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    // position: "top-right",
    // autoClose: 5000, // Errors might stay longer
    // hideProgressBar: false,
    // closeOnClick: true,
    // pauseOnHover: true,
    // draggable: true,
    // progress: undefined,
    // theme: "colored",
  });
};

export const showInfoToast = (message) => {
  toast.info(message);
};

export const showWarningToast = (message) => {
  toast.warn(message);
};
