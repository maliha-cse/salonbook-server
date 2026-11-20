import { verifyJWT } from "../middleware/jwt.middleware.js";
import express from "express";
import {
  createService,
  updateService,
  deleteService,
} from "../controllers/adminServices.controller.js";
import {
  verifyUser,
  verifyAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Only authenticated admins can manage services
router.use(verifyUser, verifyJWT, verifyAdmin);

router.post("/", createService);
router.patch("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
