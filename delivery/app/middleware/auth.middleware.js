const auth = require("../controllers/auth.controller");

/**
 * Authentication middleware to protect routes
 * Use this middleware on routes that require authentication
 */
const authenticate = auth.verifyToken;

module.exports = {
  authenticate,
};

