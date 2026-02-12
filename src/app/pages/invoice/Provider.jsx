import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";
import { InvoiceContext } from "./context";
// import { doctors } from "./list/data";

export function InvoiceProvider({ children }) {
  const createAppointment = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/appointments/create", payload);

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
  const getAllInvoice = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/invoices/get", payload);

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
  const lunasInvoice = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/invoices/updatestatus", payload);

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
  const rescheduleAppointment = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post(
        "/api/appointments/reschedule",
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
  const getAllPatient = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/patient/get", payload);

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
  const getAllDoctors = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/users/doctor/get", payload);

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
  const Tindakan = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/invoices/create", payload);

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
  const getAllObat = async (payload) => {
    try {
      // console.log("Payload:",payload);
      const response = await axios.post("/api/items/get", payload);

      // Success → toast success
      // toast.success(response.data.message || "");
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
    getAllInvoice,
    createAppointment,
    lunasInvoice,
    rescheduleAppointment,
    getAllAdmin,
    getAllDoctors,
    getAllPatient,
    Tindakan,
    getAllObat,
  };

  return <InvoiceContext value={api}>{children}</InvoiceContext>;
}

InvoiceProvider.propTypes = {
  children: PropTypes.node,
};
