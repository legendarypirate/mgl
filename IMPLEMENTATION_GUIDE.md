# Production Security Implementation Guide

This guide walks you through implementing the production-grade security system.

## Quick Start

### 1. Install Dependencies

```bash
cd delivery
npm install helmet express-rate-limit cookie-parser dotenv
```

Or use the secure package.json:

```bash
cd delivery
cp package.json.secure package.json
npm install
```

### 2. Database Migration

Create the refresh token table:

```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  userAgent VARCHAR(500),
  ipAddress VARCHAR(45),
  revoked BOOLEAN DEFAULT FALSE,
  revokedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_userId (userId),
  INDEX idx_expiresAt (expiresAt)
);
```

Or use Sequelize migration:

```bash
# The model is already created at app/models/refreshToken.model.js
# Sequelize will create the table on sync
```

### 3. Environment Variables

Copy the example file:

```bash
cd delivery
cp env.example .env
```

Edit `.env` and set:

```env
NODE_ENV=production
ACCESS_TOKEN_SECRET=<generate-strong-secret-32-chars-min>
REFRESH_TOKEN_SECRET=<generate-strong-secret-32-chars-min>
ALLOWED_ORIGINS=https://yourdomain.com
BCRYPT_SALT_ROUNDS=10
```

Generate secrets:

```bash
openssl rand -base64 32
```

### 4. Update Models

The `app/models/index.js` has been updated to include `refreshTokens`. Ensure it's synced:

```javascript
// Already done in the updated index.js
db.refreshTokens = require("./refreshToken.model.js")(sequelize, Sequelize);
```

### 5. Start Secure Server

```bash
cd delivery
node server.secure.js
```

Or for development:

```bash
npm run dev
```

## File Structure

```
delivery/
├── app/
│   ├── controllers/
│   │   └── auth.controller.secure.js    # Secure auth controller
│   ├── middleware/
│   │   ├── security.middleware.js        # Security middleware config
│   │   └── auth.middleware.secure.js    # Auth middleware
│   ├── models/
│   │   └── refreshToken.model.js        # Refresh token model
│   └── routes/
│       └── auth.routes.secure.js        # Secure auth routes
├── server.secure.js                     # Secure server
├── env.example                          # Environment variables example
└── package.json.secure                  # Updated dependencies

newbackoffice/
├── lib/
│   └── auth/
│       └── auth.service.ts             # Secure auth service
├── app/
│   └── login-secure.example.tsx         # Secure login example
└── middleware.ts                        # Updated with JWT validation
```

## Migration from Old System

### Backend Migration

1. **Backup current auth controller**:
```bash
cp app/controllers/auth.controller.js app/controllers/auth.controller.backup.js
```

2. **Use secure controller**:
```bash
# Option 1: Replace (recommended for new projects)
cp app/controllers/auth.controller.secure.js app/controllers/auth.controller.js

# Option 2: Use both (gradual migration)
# Update routes to use auth.controller.secure
```

3. **Update routes**:
```javascript
// Old
require("./app/routes/auth.routes")(app);

// New
require("./app/routes/auth.routes.secure")(app);
```

4. **Update server**:
```javascript
// Use server.secure.js or update server.js with security middleware
```

### Frontend Migration

1. **Install auth service**:
```bash
# Already created at lib/auth/auth.service.ts
```

2. **Update login form**:
```typescript
// Old
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// New
import { login } from '@/lib/auth/auth.service';
const result = await login(username, password);
// Token stored automatically in memory
```

3. **Update API calls**:
```typescript
// Old
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// New
import { authenticatedFetch } from '@/lib/auth/auth.service';
const response = await authenticatedFetch('/api/data');
// Token refresh handled automatically
```

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "username": "user123",
  "password": "securepassword",
  "role_id": 1,
  "phone": "1234567890",
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "user123",
    "role": 1,
    "permissions": []
  }
}
```
*Refresh token set in httpOnly cookie automatically*

**POST /api/auth/login**
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

Response: Same as register

**POST /api/auth/refresh**
- No body required
- Refresh token from httpOnly cookie
- Returns new access token

**POST /api/auth/logout**
- No body required
- Revokes refresh token
- Clears cookie

**GET /api/auth/verify**
- Requires Authorization header: `Bearer <accessToken>`
- Returns token validity and user info

### Protected Routes

Use middleware:

```javascript
const { authenticate } = require('./middleware/auth.middleware.secure');

router.get('/protected', authenticate, (req, res) => {
  // req.user contains decoded token
  res.json({ user: req.user });
});
```

## Testing

### Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -c cookies.txt

# Response includes accessToken
# Refresh token saved in cookies.txt
```

### Test Refresh

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# Returns new accessToken
# New refresh token in cookies.txt
```

### Test Protected Route

```bash
curl http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer <accessToken>"
```

## Troubleshooting

### "Refresh token model not initialized"

Ensure `refreshTokens` is in `app/models/index.js`:
```javascript
db.refreshTokens = require("./refreshToken.model.js")(sequelize, Sequelize);
```

### "CORS error"

Check `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

### "Token is invalid"

- Check `ACCESS_TOKEN_SECRET` matches between backend and frontend
- Ensure token hasn't expired (15 minutes)
- Verify token format: `Bearer <token>`

### "Rate limit exceeded"

- Wait 15 minutes
- Adjust limits in `security.middleware.js`
- Check if behind proxy (adjust trust proxy)

## Production Checklist

- [ ] Generate strong secrets (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` (HTTPS only)
- [ ] Enable HTTPS
- [ ] Create refresh token table
- [ ] Test token refresh flow
- [ ] Test logout flow
- [ ] Monitor rate limit logs
- [ ] Set up error logging
- [ ] Configure reverse proxy (if used)
- [ ] Test CORS in production
- [ ] Verify HSTS headers
- [ ] Test token expiration
- [ ] Test token revocation

## Next Steps

1. Review `SECURITY.md` for detailed security explanations
2. Customize rate limits based on your traffic
3. Add additional security headers if needed
4. Implement account lockout (optional)
5. Add 2FA (optional)
6. Set up monitoring and alerting

## Support

For issues or questions, refer to:
- `SECURITY.md` - Security architecture details
- Code comments - Inline explanations
- OWASP guidelines - Industry best practices

