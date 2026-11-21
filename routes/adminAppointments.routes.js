
import express from "express";
import {
  getAllAppointments,
  confirmAppointment,
  cancelAppointment,
} from "../controllers/adminAppointments.controller.js";
import { verifyUser, verifyAdmin } from "../middleware/auth.middleware.js";
import { verifyJWT } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Only authenticated admins can access these routes
router.use(verifyUser, verifyJWT, verifyAdmin);

// Get all appointments
router.get("/", getAllAppointments);

// Confirm a pending appointment
router.patch("/:id/confirm", confirmAppointment);

// Cancel a pending or confirmed appointment
router.patch("/:id/cancel", cancelAppointment);

export default router;
