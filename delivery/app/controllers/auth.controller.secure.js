/**
 * Secure Authentication Controller
 * 
 * Production-grade authentication with JWT access tokens and refresh tokens.
 * 
 * Security features:
 * - Access tokens: Short-lived (15 minutes) for API requests
 * - Refresh tokens: Long-lived (7 days) stored in httpOnly cookies
 * - Password hashing: bcrypt with 10+ salt rounds
 * - Token rotation: New refresh token on each refresh
 * - Token revocation: Ability to revoke refresh tokens
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../models");
const { Op } = require("sequelize");
const User = db.users;
const RefreshToken = db.refreshTokens || null; // Will be set after model sync

// JWT secrets from environment variables
// In production, these should be strong, random strings (min 32 chars)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret_change_in_production_min_32_chars';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_change_in_production_min_32_chars';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes - short-lived for security
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days - long-lived for user convenience

// Bcrypt salt rounds - 10+ is recommended for production
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Generate Access Token
 * 
 * Access tokens are short-lived and contain minimal user info.
 * They are sent via Authorization header (Bearer token).
 * 
 * Security: Short expiry limits damage if token is compromised.
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role_id,
    // Don't include sensitive data in token
    type: 'access'
  };
  
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'your-app-name', // Identifies token issuer
    audience: 'your-app-name' // Identifies token audience
  });
};

/**
 * Generate Refresh Token
 * 
 * Refresh tokens are long-lived and stored in httpOnly cookies.
 * They are used to obtain new access tokens without re-authentication.
 * 
 * Security: 
 * - Stored in httpOnly cookie (not accessible via JavaScript)
 * - Can be revoked if compromised
 * - Rotated on each use (token rotation)
 * - Cryptographically random (128 hex chars = 512 bits of entropy)
 */
const generateRefreshToken = () => {
  // Generate a cryptographically secure random token
  // 64 bytes = 128 hex characters = 512 bits of entropy
  // This is stored in database as plain text for efficient lookup
  // Security: Token is already cryptographically random, httpOnly cookie prevents XSS
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Set Refresh Token Cookie
 * 
 * Sets httpOnly, secure, sameSite=strict cookie for refresh token.
 * 
 * Security decisions:
 * - httpOnly: Prevents JavaScript access (XSS protection)
 * - secure: Only sent over HTTPS (production)
 * - sameSite=strict: Prevents CSRF attacks
 * - path=/api/auth/refresh: Only sent to refresh endpoint
 */
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  res.cookie('refreshToken', token, {
    httpOnly: true, // Critical: Prevents XSS attacks
    secure: isProduction, // Only over HTTPS in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: maxAge,
    path: '/api/auth/refresh' // Only sent to refresh endpoint
  });
};

/**
 * Clear Refresh Token Cookie
 * 
 * Removes refresh token cookie on logout.
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });
};

/**
 * Register User
 * 
 * Creates a new user with hashed password.
 * 
 * Security:
 * - Password is hashed with bcrypt (10+ salt rounds)
 * - Password is never stored in plaintext
 * - Returns access + refresh tokens on successful registration
 */
exports.register = async (req, res) => {
  const { username, password, role_id, phone, email } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username and password are required!" 
    });
  }

  // Password strength validation (optional but recommended)
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long!"
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { username },
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : [])
        ]
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists!" 
      });
    }

    // Hash password with bcrypt (10+ salt rounds for security)
    // This is one-way encryption - password cannot be recovered
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role_id: role_id || null,
      phone: phone || null,
      email: email || null
    });

    // Fetch user permissions if role-based access is used
    let permissions = [];
    if (newUser.role_id) {
      const rolePermissions = await db.role_permissions.findAll({
        where: { role_id: newUser.role_id },
        include: [{
          model: db.permissions,
          as: 'permission',
          attributes: ['module', 'action'],
        }],
      });
      permissions = rolePermissions
        .map(rp => rp.permission ? `${rp.permission.module}:${rp.permission.action}` : null)
        .filter(Boolean);
    }

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken();

    // Store refresh token in database (plain text for efficient lookup)
    // Security: Token is cryptographically random (512 bits entropy)
    // httpOnly cookie prevents XSS access, database access is protected
    // IMPORTANT: Store as plain text (NOT hashed) for efficient database lookup
    if (RefreshToken) {
      await RefreshToken.create({
        token: refreshToken, // Plain text - NOT hashed (for efficient lookup)
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('user-agent') || null,
        ipAddress: req.ip || req.connection.remoteAddress || null
      });
    }

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return access token in response (not in cookie for security)
    // Client stores this in memory or secure storage
    // IMPORTANT: All user data returned as plain text (not encrypted)
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken, // Plain text JWT token (client stores this)
      user: {
        id: newUser.id,
        username: newUser.username, // Plain text
        role: newUser.role_id,      // Plain text
        permissions                 // Plain text array
      }
      // Note: refreshToken is NOT in response - it's in httpOnly cookie (plain text)
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

/**
 * Login User
 * 
 * Authenticates user and returns access + refresh tokens.
 * 
 * Security:
 * - Uses bcrypt.compare for constant-time password verification
 * - Generic error messages prevent user enumeration
 * - Rate limiting should be applied to this endpoint
 */
exports.login = async (req, res) => {
  const { username, phone, password } = req.body;

  // Input validation
  const identifier = username || phone;
  if (!identifier || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username or phone and password are required!" 
    });
  }

  try {
    // Find user by username or phone
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { phone: identifier }
        ]
      }
    });

    // Generic error message to prevent user enumeration
    // Don't reveal whether user exists or not
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials!" 
      });
    }

    // Verify password using bcrypt.compare
    // This is constant-time comparison to prevent timing attacks
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials!" 
      });
    }

    // Fetch user permissions
    let permissions = [];
    if (user.role_id) {
      const rolePermissions = await db.role_permissions.findAll({
        where: { role_id: user.role_id },
        include: [{
          model: db.permissions,
          as: 'permission',
          attributes: ['module', 'action'],
        }],
      });
      permissions = rolePermissions
        .map(rp => rp.permission ? `${rp.permission.module}:${rp.permission.action}` : null)
        .filter(Boolean);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token in database (plain text for efficient lookup)
    // Security: Token is cryptographically random (512 bits entropy)
    // httpOnly cookie prevents XSS access, database access is protected
    // IMPORTANT: Store as plain text (NOT hashed) for efficient database lookup
    if (RefreshToken) {
      // Optional: Revoke old refresh tokens for this user (token rotation)
      // await RefreshToken.update(
      //   { revoked: true, revokedAt: new Date() },
      //   { where: { userId: user.id, revoked: false } }
      // );

      await RefreshToken.create({
        token: refreshToken, // Plain text - NOT hashed (for efficient lookup)
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('user-agent') || null,
        ipAddress: req.ip || req.connection.remoteAddress || null
      });
    }

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return access token
    // IMPORTANT: All user data returned as plain text (not encrypted)
    res.json({
      success: true,
      accessToken, // Plain text JWT token (client stores this)
      user: {
        id: user.id,
        username: user.username, // Plain text
        role: user.role_id,       // Plain text
        permissions              // Plain text array
      }
      // Note: refreshToken is NOT in response - it's in httpOnly cookie (plain text)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

/**
 * Refresh Access Token
 * 
 * Exchanges refresh token for new access token.
 * Implements token rotation for enhanced security.
 * 
 * Security:
 * - Refresh token is validated from httpOnly cookie
 * - Old refresh token is revoked (token rotation)
 * - New refresh token is issued
 * - Prevents token reuse if compromised
 */
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing!"
      });
    }

    if (!RefreshToken) {
      return res.status(500).json({
        success: false,
        message: "Refresh token model not initialized!"
      });
    }

    // Find refresh token in database (direct lookup - efficient)
    // Token is stored as plain text for fast database lookup
    const matchedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken, // Direct lookup by token (indexed)
        revoked: false,
        expiresAt: {
          [Op.gt]: new Date() // Not expired
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'role_id']
      }]
    });

    if (!matchedToken || !matchedToken.user) {
      // Token not found or expired - clear cookie
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token!"
      });
    }

    // Token rotation: Revoke old token
    await RefreshToken.update(
      { revoked: true, revokedAt: new Date() },
      { where: { id: matchedToken.id } }
    );

    // Generate new tokens
    const newAccessToken = generateAccessToken(matchedToken.user);
    const newRefreshToken = generateRefreshToken();

    // Store new refresh token (plain text for efficient lookup)
    // IMPORTANT: Store as plain text (NOT hashed) for efficient database lookup
    await RefreshToken.create({
      token: newRefreshToken, // Plain text - NOT hashed (for efficient lookup)
      userId: matchedToken.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('user-agent') || null,
      ipAddress: req.ip || req.connection.remoteAddress || null
    });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // Return new access token
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    clearRefreshTokenCookie(res);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Logout User
 * 
 * Revokes refresh token and clears cookie.
 * 
 * Security:
 * - Refresh token is revoked in database
 * - Cookie is cleared
 * - Access token is invalidated (client should discard it)
 */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken && RefreshToken) {
      // Find and revoke refresh token (direct lookup - efficient)
      await RefreshToken.update(
        { revoked: true, revokedAt: new Date() },
        { 
          where: { 
            token: refreshToken, // Direct lookup by token (indexed)
            revoked: false 
          } 
        }
      );
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: "Logged out successfully!"
    });
  } catch (err) {
    console.error('Logout error:', err);
    // Still clear cookie even if database operation fails
    clearRefreshTokenCookie(res);
    res.json({
      success: true,
      message: "Logged out successfully!"
    });
  }
};

/**
 * Verify Access Token (Middleware)
 * 
 * Validates access token from Authorization header.
 * Used to protect routes that require authentication.
 * 
 * Security:
 * - Token must be valid and not expired
 * - Token signature is verified
 * - User info is attached to request object
 */
exports.verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "Access token is missing!" 
    });
  }

  // Extract token (supports "Bearer token" format)
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Access token is missing!" 
    });
  }

  // Verify token
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return res.status(401).json({ 
        success: false,
        message: "Access token is invalid or expired!" 
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  });
};

/**
 * Verify Token Endpoint
 * 
 * Public endpoint to verify if access token is valid.
 * Useful for frontend to check authentication status.
 */
exports.verify = (req, res) => {
  exports.verifyToken(req, res, () => {
    res.status(200).json({
      success: true,
      message: "Token is valid!",
      user: req.user
    });
  });
};

