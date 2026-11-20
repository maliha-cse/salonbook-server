
import express from "express";
import { generateToken } from "../controllers/token.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Generate JWT only for authenticated users
router.post("/", verifyUser, generateToken);

export default router;
