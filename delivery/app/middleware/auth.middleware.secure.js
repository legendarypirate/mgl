/**
 * Secure Authentication Middleware
 * 
 * Middleware to protect routes that require authentication.
 * 
 * Usage:
 * const { authenticate } = require('./middleware/auth.middleware.secure');
 * router.get('/protected', authenticate, controller.handler);
 */

const auth = require("../controllers/auth.controller.secure");

/**
 * Authenticate Middleware
 * 
 * Verifies access token from Authorization header.
 * 
 * Security:
 * - Token must be valid and not expired
 * - User info is attached to req.user
 * - Returns 401 if token is missing or invalid
 */
const authenticate = auth.verifyToken;

/**
 * Optional: Role-based access control middleware
 * 
 * Example usage:
 * router.get('/admin', authenticate, requireRole('admin'), controller.handler);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions!"
      });
    }

    next();
  };
};

/**
 * Optional: Permission-based access control middleware
 * 
 * Example usage:
 * router.get('/delivery', authenticate, requirePermission('delivery:view_delivery'), controller.handler);
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!"
      });
    }

    // If user has permissions array in token, check it
    // Otherwise, you may need to fetch from database
    const userPermissions = req.user.permissions || [];
    
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions!"
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};

