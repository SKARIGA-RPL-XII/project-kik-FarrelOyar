import express from "express";
import { createPatient, deletePatient, editPatient, getPatients, getRoles } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/role/get", getRoles);
router.post("/patient/create", createPatient);
router.post("/patient/edit", editPatient);
router.post("/patient/delete", deletePatient);
router.post("/patient/get", getPatients);


// router.post("/", createUser);

export default router;  
