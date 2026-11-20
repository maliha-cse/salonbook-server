
import jwt from "jsonwebtoken";

// Verify JWT token against the authenticated Better Auth session
export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "JWT token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // A valid Better Auth session must also exist
    if (
      !req.user ||
      decoded.userId !== req.user.id ||
      decoded.role !== req.user.role
    ) {
      return res.status(403).json({
        success: false,
        message: "JWT does not match the authenticated user",
      });
    }

    req.jwtUser = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired JWT token",
    });
  }
};
