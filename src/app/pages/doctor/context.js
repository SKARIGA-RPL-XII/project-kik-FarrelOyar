import { createSafeContext } from "utils/createSafeContext";

export const [DoctorContext, useDoctorContext] = createSafeContext(
    "useDoctorContext must be used within DoctorProvider"
);
