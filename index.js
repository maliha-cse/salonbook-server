
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import servicesRoutes from "./routes/services.routes.js";
import adminServicesRoutes from "./routes/adminServices.routes.js";
import tokenRoutes from "./routes/token.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import { createAppointmentIndexes } from "./utils/appointmentIndexes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

const startServer = async () => {
  try {
    await connectDB();

    await createAppointmentIndexes();

    const auth = createAuth();

    // Better Auth must be mounted before express.json()
    app.all("/api/auth/{*any}", toNodeHandler(auth));

    app.use(express.json());

    app.use("/api/token", tokenRoutes);

    // Public service routes
    app.use("/api/services", servicesRoutes);

    // Admin-only service management routes
    app.use("/api/admin/services", adminServicesRoutes);

    // Customer appointment routes
    app.use("/api/appointments", appointmentsRoutes);

    app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "SalonBook API is running!",
      });
    });

    app.listen(PORT, () => {
      console.log(`SalonBook server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
