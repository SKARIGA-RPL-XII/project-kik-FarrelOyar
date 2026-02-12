import { createSafeContext } from "utils/createSafeContext";

export const [AdminContext, useAdminContext] = createSafeContext(
    "useAdminContext must be used within AdminProvider"
);
