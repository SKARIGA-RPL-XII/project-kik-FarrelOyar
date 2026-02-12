import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";
import { AdminContext } from "./context";
// import { doctors } from "./list/data";

export function AdminProvider({ children }) {
  const createAdmin = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/admin/create", payload);

      // Success → toast success
      toast.success(response.data.message || "");
      return { success: true, data: response.data };
    } catch (err) {
      const errorData = err;

      if (Array.isArray(errorData?.errors)) {
        // kalau `errors` berupa array
        errorData.errors.forEach((e) => toast.error(e));
      } else {
        // fallback single error
        toast.error(errorData?.error || errorData?.message || err.message);
      }

      return { success: false, message: errorData || err.message };
    }
  };
  const getAllAdmin = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/admin/get", payload);

      // Success → toast success
      toast.success(response.data.message || "");
      return { success: true, data: response.data };
    } catch (err) {
      const errorData = err;

      if (Array.isArray(errorData?.errors)) {
        // kalau `errors` berupa array
        errorData.errors.forEach((e) => toast.error(e));
      } else {
        // fallback single error
        toast.error(errorData?.error || errorData?.message || err.message);
      }

      return { success: false, message: errorData || err.message };
    }
  };
  const deleteDoctor = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/doctor/delete", payload);

      // Success → toast success
      toast.success(response.data.message || "");
      return { success: true, data: response.data };
    } catch (err) {
      const errorData = err;

      if (Array.isArray(errorData?.errors)) {
        // kalau `errors` berupa array
        errorData.errors.forEach((e) => toast.error(e));
      } else {
        // fallback single error
        toast.error(errorData?.error || errorData?.message || err.message);
      }

      return { success: false, message: errorData || err.message };
    }
  };
  const editDoctor = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/doctor/edit", payload);

      // Success → toast success
      toast.success(response.data.message || "");
      return { success: true, data: response.data };
    } catch (err) {
      const errorData = err;

      if (Array.isArray(errorData?.errors)) {
        // kalau `errors` berupa array
        errorData.errors.forEach((e) => toast.error(e));
      } else {
        // fallback single error
        toast.error(errorData?.error || errorData?.message || err.message);
      }

      return { success: false, message: errorData || err.message };
    }
  };
  const resetPasswordDoctor = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post(
        "/api/users/doctor/resetpassword",
        payload,
      );

      // Success → toast success
      toast.success(response.data.message || "");
      return { success: true, data: response.data };
    } catch (err) {
      const errorData = err;

      if (Array.isArray(errorData?.errors)) {
        // kalau `errors` berupa array
        errorData.errors.forEach((e) => toast.error(e));
      } else {
        // fallback single error
        toast.error(errorData?.error || errorData?.message || err.message);
      }

      return { success: false, message: errorData || err.message };
    }
  };

  const api = {
    createAdmin,
    getAllAdmin,
    deleteDoctor,
    editDoctor,
    resetPasswordDoctor,
  };

  return <AdminContext value={api}>{children}</AdminContext>;
}

AdminProvider.propTypes = {
  children: PropTypes.node,
};
