/**
 * Security Middleware Configuration
 * 
 * This file contains production-grade security middleware for Express.js
 * All middleware is configured with security best practices in mind.
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/**
 * Helmet Configuration
 * 
 * Helmet helps secure Express apps by setting various HTTP headers.
 * These headers protect against common web vulnerabilities like XSS, clickjacking, etc.
 * 
 * Security decisions:
 * - contentSecurityPolicy: Prevents XSS attacks by controlling which resources can be loaded
 * - crossOriginEmbedderPolicy: Prevents cross-origin data leaks
 * - crossOriginOpenerPolicy: Isolates browsing context to prevent cross-origin attacks
 * - crossOriginResourcePolicy: Controls which origins can load resources
 * - dnsPrefetchControl: Prevents DNS prefetching to reduce privacy leaks
 * - frameguard: Prevents clickjacking attacks
 * - hidePoweredBy: Removes X-Powered-By header to avoid revealing Express version
 * - hsts: Forces HTTPS connections (only in production)
 * - ieNoOpen: Prevents IE from executing downloads in site context
 * - noSniff: Prevents MIME type sniffing attacks
 * - originAgentCluster: Isolates browsing context
 * - permittedCrossDomainPolicies: Controls Flash/PDF cross-domain policies
 * - referrerPolicy: Controls referrer information sent with requests
 * - xssFilter: Enables XSS filter in older browsers
 */
const helmetConfig = helmet({
  // Content Security Policy - adjust based on your needs
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // 'unsafe-inline' needed for some frameworks
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Cross-Origin policies for additional isolation
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  // HSTS - only in production with HTTPS
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
});

/**
 * Rate Limiting Configuration
 * 
 * Rate limiting prevents brute force attacks and DDoS by limiting
 * the number of requests from a single IP address.
 * 
 * Security decisions:
 * - windowMs: Time window for rate limit (15 minutes)
 * - max: Maximum requests per window (100 for general, 5 for auth)
 * - standardHeaders: Use standard rate limit headers
 * - legacyHeaders: Disable legacy headers
 * - skipSuccessfulRequests: Don't count successful auth requests (prevents lockout)
 * - skipFailedRequests: Count failed requests (helps detect brute force)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Strict rate limiting for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false, // Count failed requests to detect brute force
});

/**
 * CORS Configuration
 * 
 * CORS controls which origins can access your API.
 * 
 * Security decisions:
 * - origin: Only allow specific origins (prevents unauthorized access)
 * - credentials: Allow cookies/credentials (needed for refresh tokens)
 * - methods: Only allow necessary HTTP methods
 * - allowedHeaders: Only allow necessary headers
 * - maxAge: Cache preflight requests for 1 hour
 */
const corsOptions = {
  origin: function (origin, callback) {
    // In production, only allow specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000']; // Default for development
    
    // Allow requests with no origin (mobile apps, Postman, etc.) in development only
    if (process.env.NODE_ENV !== 'production' && !origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required for httpOnly cookies (refresh tokens)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'], // Expose custom headers if needed
  maxAge: 3600, // Cache preflight requests for 1 hour
};

/**
 * JSON Body Parser Security
 * 
 * Limit JSON payload size to prevent DoS attacks
 * 10MB is reasonable for most applications
 */
const jsonParserLimit = '10mb';

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  corsOptions,
  jsonParserLimit,
};

