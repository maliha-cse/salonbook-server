
import { fromNodeHeaders } from "better-auth/node";
import { createAuth } from "../config/auth.js";

let authInstance;

const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
};

// Verify logged-in user
export const verifyUser = async (req, res, next) => {
  try {
    const auth = getAuthInstance();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });


    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please sign in first.",
      });
    }

    if (session.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Allow admin only
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};
