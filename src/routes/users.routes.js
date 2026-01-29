import express from "express";
import {
  createAdmin,
  createDoctor,
  createPatient,
  deleteAdmin,
  deleteDoctor,
  deletePatient,
  editAdmin,
  editDoctor,
  editPatient,
  getAdmin,
  getDoctors,
  getPatients,
  getRoles,
  resetAdminPassword,
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
router.post("/admin/resetpassword", resetAdminPassword);
router.post("/admin/delete", deleteAdmin);
router.post("/admin/get", getAdmin);

export default router;
