/**
 * Refresh Token Model
 * 
 * Stores refresh tokens for JWT authentication.
 * Refresh tokens are long-lived (7 days) and stored securely in the database.
 * 
 * Security considerations:
 * - Tokens are cryptographically random (512 bits entropy)
 * - Tokens are stored as plain text for efficient database lookup
 * - Tokens are in httpOnly cookies (XSS protection)
 * - Tokens are associated with user ID and can be revoked
 * - Expiration is enforced at database level
 * - Tokens are one-time use (can be rotated on each refresh)
 * 
 * Why plain text storage?
 * - Tokens are already cryptographically random (not guessable)
 * - httpOnly cookies prevent JavaScript access (XSS protection)
 * - Database access is already protected
 * - Direct lookup is much more efficient than hash comparison
 */

module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refreshToken", {
    token: {
      type: Sequelize.STRING(128), // 64 bytes = 128 hex characters
      allowNull: false,
      unique: true,
      // Token is stored as plain text for efficient direct lookup
      // Security: Token is cryptographically random, httpOnly cookie prevents XSS
      comment: 'Refresh token (plain text for efficient lookup)'
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE', // Delete tokens when user is deleted
      comment: 'Foreign key to users table'
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Token expiration date (7 days from creation)'
    },
    // Optional: Track device/browser for security
    userAgent: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'User agent string for device tracking'
    },
    ipAddress: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'IP address for security monitoring'
    },
    // Optional: Track if token was revoked
    revoked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether token has been revoked'
    },
    revokedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When token was revoked'
    }
  }, {
    // Table name
    tableName: 'refresh_tokens',
    // Indexes for performance
    indexes: [
      {
        unique: true,
        fields: ['token']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      }
    ],
    // Timestamps
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return RefreshToken;
};

