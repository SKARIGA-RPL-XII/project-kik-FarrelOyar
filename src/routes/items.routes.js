import express from "express";
import { createItem, deleteItem, editItem, getItems } from "../controllers/items.controller.js";


const router = express.Router();

router.post("/create", createItem );
router.post("/edit", editItem );
router.post("/delete", deleteItem );
router.post("/get", getItems );

export default router;
