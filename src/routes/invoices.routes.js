import express from "express";
import { createInvoice, getInvoices, payInvoice } from "../controllers/invoices.controller.js";

const router = express.Router();

router.post("/create", createInvoice);
router.post("/updatestatus", payInvoice);
router.post("/get", getInvoices);

export default router;
