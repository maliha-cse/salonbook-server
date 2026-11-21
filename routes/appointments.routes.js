
import express from "express";
import {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
} from "../controllers/appointments.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { verifyJWT } from "../middleware/jwt.middleware.js";

const router = express.Router();

// All appointment routes require authentication and a valid JWT
router.use(verifyUser, verifyJWT);

// Customer role verification
const verifyCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Only customers can access this route.",
    });
  }

  next();
};

// Create a new appointment
router.post("/", verifyCustomer, createAppointment);

// Get appointments of the logged-in customer
router.get("/my", verifyCustomer, getMyAppointments);

// Cancel own pending appointment
router.patch("/:id/cancel", verifyCustomer, cancelMyAppointment);

export default router;
