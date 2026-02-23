# Production-Grade Security Implementation Guide

This document explains the security architecture and decisions made in this production-ready authentication system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [JWT Token Strategy](#jwt-token-strategy)
3. [Backend Security](#backend-security)
4. [Frontend Security](#frontend-security)
5. [Security Middleware](#security-middleware)
6. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Two-Token System

**Access Token (Short-lived: 15 minutes)**
- Purpose: Authenticate API requests
- Storage: Memory/sessionStorage (frontend)
- Transmission: Authorization header (Bearer token)
- Security: Short expiry limits damage if compromised

**Refresh Token (Long-lived: 7 days)**
- Purpose: Obtain new access tokens without re-authentication
- Storage: httpOnly cookie (backend sets, frontend cannot access)
- Transmission: Automatically sent with requests
- Security: httpOnly prevents XSS, sameSite prevents CSRF

### Why This Architecture?

1. **Security**: Short-lived access tokens limit exposure window
2. **User Experience**: Long-lived refresh tokens avoid frequent logins
3. **Revocation**: Refresh tokens can be revoked server-side
4. **XSS Protection**: httpOnly cookies cannot be accessed via JavaScript

---

## JWT Token Strategy

### Access Token Structure

```json
{
  "id": 123,
  "username": "user123",
  "role": 1,
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Security Decisions:**
- Minimal payload: Only essential user info
- No sensitive data: Never include passwords, secrets
- Type field: Distinguishes access from refresh tokens
- Short expiry: 15 minutes reduces attack window

### Refresh Token Storage

Refresh tokens are:
1. Generated using `crypto.randomBytes(64)` (cryptographically secure, 512 bits entropy)
2. Stored as plain text in database (for efficient direct lookup)
3. Stored in database with expiration and revocation flags
4. Sent to client in httpOnly cookie

**Why Plain Text Storage?**
- Tokens are already cryptographically random (not guessable)
- httpOnly cookies prevent JavaScript access (XSS protection)
- Database access is already protected
- Direct lookup is much more efficient than hash comparison
- If database is compromised, hashing doesn't add significant security (attacker can still use tokens)

**Security Layers:**
- Cryptographically random (512 bits = 2^512 possible values)
- httpOnly cookie (XSS protection)
- SameSite=Strict (CSRF protection)
- Expiration enforcement
- Revocation capability

### Token Rotation

On each refresh:
1. Old refresh token is revoked
2. New refresh token is generated
3. New refresh token is stored
4. Old token cannot be reused

**Benefits:**
- Limits damage if token is compromised
- Detects token theft (old token used = compromise)
- Forces periodic re-authentication

---

## Backend Security

### 1. Helmet.js Configuration

Helmet sets HTTP security headers:

```javascript
contentSecurityPolicy: Prevents XSS via resource loading control
crossOriginEmbedderPolicy: Prevents cross-origin data leaks
crossOriginOpenerPolicy: Isolates browsing context
hsts: Forces HTTPS (production only)
noSniff: Prevents MIME type sniffing
xssFilter: Enables XSS filter in older browsers
```

**Why Each Header?**
- **CSP**: Controls which resources can load (prevents XSS)
- **HSTS**: Forces HTTPS connections (prevents MITM)
- **noSniff**: Prevents MIME confusion attacks
- **COEP/COOP**: Isolates browsing contexts (prevents cross-origin attacks)

### 2. Rate Limiting

**General Rate Limit**: 100 requests per 15 minutes
- Prevents DDoS attacks
- Protects against resource exhaustion

**Auth Rate Limit**: 5 requests per 15 minutes
- Prevents brute force attacks
- Slows down password guessing

**Why These Limits?**
- General: High enough for normal use, low enough to prevent abuse
- Auth: Low enough to prevent brute force, high enough for typos

### 3. CORS Configuration

```javascript
origin: Only specific allowed origins
credentials: true (required for cookies)
methods: Only necessary HTTP methods
allowedHeaders: Only necessary headers
```

**Security Decisions:**
- Whitelist approach: Only allow known origins
- Credentials: Required for httpOnly cookies
- Minimal methods: Reduces attack surface
- Minimal headers: Prevents header injection

### 4. Password Hashing

**Bcrypt with 10+ salt rounds**

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Why Bcrypt?**
- Adaptive hashing: Can increase rounds as hardware improves
- Salt included: Prevents rainbow table attacks
- Slow by design: Makes brute force expensive
- 10 rounds: Good balance of security and performance

**Why Not Less?**
- < 10 rounds: Too fast, vulnerable to brute force
- > 12 rounds: Too slow, poor user experience

### 5. SQL Injection Protection

**Using Sequelize ORM**

Sequelize uses parameterized queries:

```javascript
User.findOne({ where: { username: userInput } })
// Generates: SELECT * FROM users WHERE username = ? [userInput]
```

**Why ORM?**
- Parameterized queries: Prevents SQL injection
- Type safety: Validates input types
- Escaping: Automatically escapes special characters

**Never do this:**
```javascript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE username = '${userInput}'`;

// ✅ SAFE
User.findOne({ where: { username: userInput } })
```

---

## Frontend Security

### 1. Access Token Storage

**Memory + sessionStorage (NOT localStorage)**

```typescript
// ✅ SAFE: Memory + sessionStorage
tokenStorage.accessToken = token;
sessionStorage.setItem('accessToken', token);

// ❌ VULNERABLE: localStorage
localStorage.setItem('accessToken', token);
```

**Why Not localStorage?**
- Persistent: Survives browser restarts
- Accessible: JavaScript can access (XSS risk)
- No expiration: Tokens persist indefinitely

**Why sessionStorage?**
- Tab-scoped: Cleared when tab closes
- Less persistent: Better security
- Still accessible: But cleared on close

**Why Memory?**
- Fastest access: No I/O overhead
- Cleared on refresh: Forces re-authentication
- Not accessible: Cannot be read by other scripts

### 2. Refresh Token Handling

**Automatic via httpOnly Cookie**

```typescript
// ✅ Automatic: Backend sets httpOnly cookie
fetch('/api/auth/login', { credentials: 'include' });

// ❌ Manual: Don't store refresh token in JavaScript
localStorage.setItem('refreshToken', token);
```

**Why httpOnly Cookie?**
- Not accessible: JavaScript cannot read (XSS protection)
- Automatic: Sent with requests automatically
- Secure: Can set secure flag (HTTPS only)
- SameSite: Prevents CSRF attacks

### 3. Automatic Token Refresh

**Before Each Request:**
1. Check if access token exists
2. If expired or missing, refresh automatically
3. Retry request with new token

**Why Automatic?**
- Seamless UX: User doesn't notice token refresh
- Always valid: Requests always have valid token
- Error handling: Falls back to login if refresh fails

### 4. XSS Protection

**Measures:**
- No eval(): Never use eval() or similar
- Content Security Policy: Backend sets CSP headers
- Input sanitization: Sanitize user input
- React escaping: React automatically escapes JSX

**Why Important?**
- XSS can steal tokens: If token in localStorage
- XSS can hijack sessions: If cookies accessible
- XSS can inject malicious code: Execute arbitrary JavaScript

### 5. CSRF Protection

**SameSite=Strict Cookies**

```javascript
res.cookie('refreshToken', token, {
  sameSite: 'strict'
});
```

**How It Works:**
- Strict: Cookie only sent on same-site requests
- Prevents: Cross-site requests cannot include cookie
- Protection: CSRF attacks cannot use refresh token

**Why Strict?**
- Lax: Sent on top-level navigation (less secure)
- None: Sent on all requests (no CSRF protection)
- Strict: Only same-site (maximum security)

---

## Security Middleware

### Order Matters!

```javascript
1. Helmet (security headers)
2. CORS (origin control)
3. Cookie Parser (cookie parsing)
4. Body Parser (request body)
5. Rate Limiting (abuse prevention)
6. Routes (application logic)
```

**Why This Order?**
- Headers first: Set security headers early
- CORS early: Reject unauthorized origins quickly
- Parsers before routes: Parse before processing
- Rate limit before routes: Block abuse early

### Trust Proxy

```javascript
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

**Why?**
- Behind reverse proxy: nginx, load balancer
- Accurate IPs: req.ip works correctly
- Rate limiting: Based on real client IP
- Security: Prevents IP spoofing

---

## Deployment Checklist

### Environment Variables

- [ ] `NODE_ENV=production`
- [ ] `ACCESS_TOKEN_SECRET` (32+ characters, random)
- [ ] `REFRESH_TOKEN_SECRET` (32+ characters, random)
- [ ] `ALLOWED_ORIGINS` (comma-separated, HTTPS only)
- [ ] `BCRYPT_SALT_ROUNDS=10` (or higher)

### Generate Secrets

```bash
# Generate strong secrets
openssl rand -base64 32
```

### HTTPS Configuration

- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] HSTS headers enabled
- [ ] Secure cookie flag enabled

### Database

- [ ] Refresh token table created
- [ ] Indexes created (performance)
- [ ] Foreign keys enabled (data integrity)

### CORS

- [ ] Only production domains in `ALLOWED_ORIGINS`
- [ ] No wildcards (`*`) in production
- [ ] Credentials enabled for cookies

### Rate Limiting

- [ ] General limit: 100/15min
- [ ] Auth limit: 5/15min
- [ ] Adjust based on traffic

### Monitoring

- [ ] Failed login attempts logged
- [ ] Token refresh failures logged
- [ ] Rate limit violations logged
- [ ] Unusual patterns detected

---

## Security Best Practices

### Do's ✅

- Use HTTPS in production
- Store access tokens in memory/sessionStorage
- Use httpOnly cookies for refresh tokens
- Implement token rotation
- Hash refresh tokens before storage
- Use strong, random secrets (32+ chars)
- Rate limit authentication endpoints
- Log security events
- Validate all input
- Use parameterized queries (ORM)

### Don'ts ❌

- Don't store tokens in localStorage
- Don't expose secrets in code
- Don't use weak secrets
- Don't skip input validation
- Don't trust client-side validation
- Don't disable CORS in production
- Don't use wildcard CORS origins
- Don't skip rate limiting
- Don't log sensitive data
- Don't use eval() or similar

---

## Common Attacks & Mitigations

### 1. XSS (Cross-Site Scripting)

**Attack**: Inject malicious JavaScript
**Mitigation**:
- CSP headers (Helmet)
- Input sanitization
- React escaping
- httpOnly cookies (refresh tokens)

### 2. CSRF (Cross-Site Request Forgery)

**Attack**: Forge requests from other sites
**Mitigation**:
- SameSite=Strict cookies
- CSRF tokens (if needed)
- Origin validation

### 3. Brute Force

**Attack**: Guess passwords
**Mitigation**:
- Rate limiting (5 attempts/15min)
- Strong password requirements
- Account lockout (optional)

### 4. Token Theft

**Attack**: Steal access/refresh tokens
**Mitigation**:
- Short-lived access tokens (15min)
- httpOnly cookies (refresh tokens)
- Token rotation
- Revocation capability

### 5. SQL Injection

**Attack**: Inject SQL code
**Mitigation**:
- ORM (Sequelize)
- Parameterized queries
- Input validation

### 6. Man-in-the-Middle

**Attack**: Intercept traffic
**Mitigation**:
- HTTPS only
- HSTS headers
- Certificate pinning (optional)

---

## Questions & Answers

**Q: Why not store access token in httpOnly cookie?**
A: Access tokens are used frequently. Cookies are sent with every request, increasing size. Authorization header is more efficient.

**Q: Why hash refresh tokens?**
A: If database is compromised, hashed tokens cannot be used. Similar to password security.

**Q: Why token rotation?**
A: Limits damage if token is stolen. Old token cannot be reused, detecting theft.

**Q: Why 15 minutes for access token?**
A: Balance between security (short) and UX (not too frequent refreshes).

**Q: Why 7 days for refresh token?**
A: Long enough for good UX, short enough to force periodic re-authentication.

**Q: Can I use localStorage for access tokens?**
A: Not recommended. XSS can steal tokens. Use memory/sessionStorage instead.

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Support

For security issues, please report responsibly through proper channels.

**Last Updated**: 2024
**Version**: 1.0.0

