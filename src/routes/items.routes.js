import express from "express";
import { createItem, editItem } from "../controllers/items.controller.js";


const router = express.Router();

router.post("/create", createItem );
router.post("/edit", editItem );

export default router;
