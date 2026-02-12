import { createSafeContext } from "utils/createSafeContext";

export const [AppointmentContext, useAppointmentContext] = createSafeContext(
    "useAppointmentContext must be used within AppointmentProvider"
);
