/**
 * Secure Authentication Routes
 * 
 * Production-grade authentication routes with refresh token support.
 * 
 * Routes:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Logout user
 * - GET /api/auth/verify - Verify access token
 */

module.exports = (app) => {
  const auth = require("../controllers/auth.controller.secure");
  const { authLimiter } = require("../middleware/security.middleware");
  
  var router = require("express").Router();
  
  // Register route - rate limited to prevent abuse
  router.post("/register", authLimiter, auth.register);
  
  // Login route - rate limited to prevent brute force attacks
  router.post("/login", authLimiter, auth.login);
  
  // Refresh token route - no rate limit (but should be used sparingly)
  router.post("/refresh", auth.refreshToken);
  
  // Logout route
  router.post("/logout", auth.logout);
  
  // Verify token route (protected - requires valid access token)
  router.get("/verify", auth.verifyToken, auth.verify);
  
  app.use("/api/auth", router);
};

