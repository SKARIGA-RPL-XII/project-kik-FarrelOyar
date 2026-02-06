import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";
import { PatientContext } from "./context";
// import { doctors } from "./list/data";

export function PatientProvider({ children }) {
  const getAllPatients = async (payload) => {
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
  

  const api = {
    getAllPatients,
  };

  return (
    <PatientContext value={api}>{children}</PatientContext>
  );
}

PatientProvider.propTypes = {
  children: PropTypes.node,
};
