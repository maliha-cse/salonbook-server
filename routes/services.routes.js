
import express from "express";
import {
  getServices,
  getServiceById,
} from "../controllers/services.controller.js";

const router = express.Router();

// Get all services
router.get("/", getServices);

// Get service details by ID
router.get("/:id", getServiceById);

export default router;
