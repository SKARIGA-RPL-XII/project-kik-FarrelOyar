import express from "express";
import { getProfile, login } from "../controllers/auth.controller.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/user/profile", auth, getProfile);

export default router;
    