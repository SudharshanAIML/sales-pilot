import { USER_ROLES } from "../utils/constants.js";

/**
 * Role-based access control middleware
 * Usage: authorizeRoles("ADMIN"), authorizeRoles("ADMIN", "EMPLOYEE")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};

/**
 * Convenience middleware for admin-only routes
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: "Admin access required",
    });
  }
  next();
};
