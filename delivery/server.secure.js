/**
 * Secure Express Server Configuration
 * 
 * Production-grade Express.js server with comprehensive security middleware.
 * 
 * Security features:
 * - Helmet: HTTP security headers
 * - Rate limiting: Prevents brute force and DDoS
 * - CORS: Strict origin control
 * - Body parser limits: Prevents DoS attacks
 * - Trust proxy: For accurate IP addresses behind reverse proxy
 */

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require('dotenv').config(); // Load environment variables

// Import security middleware
const {
  helmetConfig,
  generalLimiter,
  authLimiter,
  corsOptions,
  jsonParserLimit
} = require("./app/middleware/security.middleware");

const app = express();

// ============================================
// Trust Proxy Configuration
// ============================================
// If behind reverse proxy (nginx, load balancer), trust first proxy
// This ensures req.ip and req.secure work correctly
// Only enable in production with actual reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
}

// ============================================
// Security Middleware (Order Matters!)
// ============================================

// 1. Helmet - Must be first to set security headers
app.use(helmetConfig);

// 2. CORS - Must be before routes
app.use(require("cors")(corsOptions));

// 3. Cookie Parser - For refresh token cookies
app.use(cookieParser());

// 4. Body Parsers with size limits
// Limit prevents DoS attacks via large payloads
app.use(express.json({ limit: jsonParserLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonParserLimit }));

// ============================================
// Rate Limiting
// ============================================

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Note: Auth-specific rate limiting is applied in auth routes

// ============================================
// Static Files
// ============================================
// Serve static files (images) from the 'app/assets' folder
app.use("/assets", express.static(path.join(__dirname, "app", "assets")));

// ============================================
// Database Setup
// ============================================
const db = require("./app/models");

// Sync database and handle any errors
db.sequelize.sync()
  .then(() => {
    console.log("Database synced successfully.");
    
    // Initialize RefreshToken model if it exists
    if (db.refreshTokens) {
      console.log("RefreshToken model initialized.");
    }
  })
  .catch((err) => {
    console.error("Failed to sync database:", err.message);
  });

// ============================================
// Routes
// ============================================

// Health check route (before authentication)
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the secure API.",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Authentication Routes (Secure)
// ============================================
// Use the secure auth routes with refresh token support
require("./app/routes/auth.routes.secure")(app);

// ============================================
// Protected Routes
// ============================================
// All routes below require authentication
// Example: const { authenticate } = require("./app/middleware/auth.middleware.secure");

// Import your existing routes
require("./app/routes/ware.routes")(app);
require("./app/routes/good.routes")(app);
require("./app/routes/age.routes")(app);
require("./app/routes/doctor.routes")(app);
require("./app/routes/info.routes")(app);
require("./app/routes/delivery.routes")(app);
require("./app/routes/status.routes")(app);
require("./app/routes/order.routes")(app);
require("./app/routes/region.routes")(app);
require("./app/routes/notification.routes")(app);
require("./app/routes/report.routes")(app);
require("./app/routes/summary.routes")(app);
require("./app/routes/request.routes")(app);
require("./app/routes/banner.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/permission.routes")(app);
require("./app/routes/word.routes")(app);
require("./app/routes/category.routes")(app);
require("./app/routes/privacy.routes")(app);
require("./app/routes/rolePermission.routes")(app);
require("./app/routes/user.routes")(app);

// Mobile routes
require("./app/routes/delivery.mobile.routes")(app);
require("./app/routes/order.mobile.routes")(app);
require("./app/routes/good.mobile.routes")(app);

// ============================================
// Error Handling
// ============================================

// 404 handler for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found!" 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: message
  });
});

// ============================================
// Server Startup
// ============================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Secure server is running on port ${PORT}.`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
});

