import { createSafeContext } from "utils/createSafeContext";

export const [InvoiceContext, useInvoiceContext] = createSafeContext(
    "useInvoiceContext must be used within InvoiceProvider"
);
