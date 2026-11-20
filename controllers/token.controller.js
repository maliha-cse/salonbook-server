
import jwt from "jsonwebtoken";

// Generate JWT for an authenticated Better Auth user
export const generateToken = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const user = req.user;

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Token generated successfully",
      token,
    });
  } catch (error) {
    console.error("Token generation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
};
