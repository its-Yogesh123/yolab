// Role-based authorization middleware
// Usage: authorize("admin") or authorize("admin", "manager")

export const isAuthorize =(...allowedRoles) => (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      return next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization error" });
    }
  };

