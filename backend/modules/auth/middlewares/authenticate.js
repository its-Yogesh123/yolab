// JWT token validation middleware
export const validateToken = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token missing or malformed" });
      }
  
      const token = authHeader.split(" ")[1];
  
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret is not configured" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
  
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };