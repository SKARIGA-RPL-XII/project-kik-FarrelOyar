import express from "express";
import {
    createAdmin,
  createDoctor,
  createPatient,
  deleteDoctor,
  deletePatient,
  editAdmin,
  editDoctor,
  editPatient,
  getDoctors,
  getPatients,
  getRoles,
  resetDoctorPassword,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/role/get", getRoles);
router.post("/patient/create", createPatient);
router.post("/patient/edit", editPatient);
router.post("/patient/delete", deletePatient);
router.post("/patient/get", getPatients);

router.post("/doctor/create", createDoctor);
router.post("/doctor/edit", editDoctor);
router.post("/doctor/resetpassword", resetDoctorPassword);
router.post("/doctor/delete", deleteDoctor);
router.post("/doctor/get", getDoctors);

router.post("/admin/create", createAdmin);
router.post("/admin/edit", editAdmin);

export default router;
