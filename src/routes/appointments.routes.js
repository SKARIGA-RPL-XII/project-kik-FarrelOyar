import express from "express";
import {
    cancelAppointment,
  createAppointment,
  getAppointments,
  rescheduleAppointment,
} from "../controllers/appointments.controller.js";

const router = express.Router();

router.post("/create", createAppointment);
router.post("/reschedule", rescheduleAppointment);
router.post("/get", getAppointments );
router.post("/cancle", cancelAppointment );
// router.post("/edit", editItem );

export default router;
