import { createSafeContext } from "utils/createSafeContext";

export const [PatientContext, usePatientContext] = createSafeContext(
    "usePatientContext must be used within PatientProvider"
);
