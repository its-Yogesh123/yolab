import jwt from "jsonwebtoken";
import { validateToken } from "../auth.services.js";

// JWT token validation middleware
export const isLoggedIn = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing or malformed" });
      }
  
      const token = authHeader.split(" ")[1];
  
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret is not configured" });
      }
      const decoded = validateToken(token)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
  
      return next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };