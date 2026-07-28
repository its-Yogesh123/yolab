import { validateToken } from "../auth.services.js";

/**
 * isLoggedIn middleware
 * Reads JWT from httpOnly cookie (set by login/Google OAuth)
 * Populates req.user = { id, email, role }
 */
export const isLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated. Please log in." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    const decoded = validateToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
};