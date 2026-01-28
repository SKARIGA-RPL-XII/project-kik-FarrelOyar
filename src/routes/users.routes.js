import express from "express";
import { getUsers } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/get", getUsers);
// router.post("/", createUser);

export default router;
