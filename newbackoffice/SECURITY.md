# Security Implementation Guide

## Overview

The newbackoffice application now implements comprehensive security measures at the SSR (Server-Side Rendering) level to protect sensitive user data and inputs.

## Key Security Features

### 1. Server-Side JWT Validation
- **Location**: `middleware.ts`
- **Function**: Validates JWT tokens server-side before allowing access to `/admin` routes
- **Protection**: Prevents unauthorized access even if client-side JavaScript is disabled
- **Implementation**: Uses `jose` library for Edge-compatible JWT verification

### 2. Encrypted Data Transmission
- **Location**: `app/api/secure/[...path]/route.ts`
- **Function**: Secure API proxy that encrypts sensitive data before sending to client
- **Protection**: Sensitive fields are encrypted in API responses
- **Fields Encrypted**: `phone`, `email`, `account_number`, `bank`, `contact_info`, `address`

### 3. Secure Storage
- **Location**: `lib/security/secure-storage.ts`
- **Function**: Encrypted localStorage wrapper
- **Protection**: Sensitive data stored in localStorage is encrypted
- **Usage**: Automatically encrypts/decrypts data on store/retrieve

### 4. Secure API Client
- **Location**: `lib/security/secure-api.ts`
- **Function**: API client that automatically handles encryption/decryption
- **Protection**: Transparent encryption for sensitive fields
- **Usage**: All service files use `secureGet`, `securePost`, `securePut`, `secureDelete`

## Architecture

```
Client (Browser)
    ↓ (HTTPS + Encryption)
Secure API Route (/api/secure/*)
    ↓ (HTTPS)
Backend API
    ↓ (HTTPS)
Secure API Route
    ↓ (Encrypted Response)
Client (Browser)
```

## Data Flow

### Request Flow
1. Client sends plain data to `/api/secure/*` route (over HTTPS)
2. Secure API route validates JWT token from cookie
3. Secure API route forwards request to backend (over HTTPS)
4. Backend processes request and returns response

### Response Flow
1. Backend returns plain data
2. Secure API route encrypts sensitive fields
3. Encrypted data sent to client (over HTTPS)
4. Client decrypts sensitive fields using Web Crypto API

## Environment Variables

Add these to your `.env.local`:

```env
# JWT secret (must match backend)
JWT_SECRET=your-jwt-secret-here

# Encryption secret for server-side encryption
ENCRYPTION_SECRET=your-encryption-secret-here

# Client-side encryption key (public, but should be unique)
NEXT_PUBLIC_ENCRYPTION_KEY=your-client-encryption-key-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Migration Guide

### For Existing Services

Replace direct `fetch` calls with secure API functions:

**Before:**
```typescript
const response = await fetch(`${API_URL}/api/user`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
});
```

**After:**
```typescript
import { securePost } from '@/lib/security/secure-api';

const result = await securePost('/user', payload);
```

### For Existing Storage

Migrate to secure storage:

**Before:**
```typescript
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
```

**After:**
```typescript
import { setSecureItem, getSecureItem } from '@/lib/security/secure-storage';

await setSecureItem('token', token);
const token = await getSecureItem<string>('token');
```

## Security Best Practices

1. **Never commit encryption keys** to version control
2. **Use strong, randomly generated keys** in production
3. **Rotate keys periodically** (every 90 days recommended)
4. **Always use HTTPS** in production
5. **Keep dependencies updated** for security patches
6. **Monitor for security vulnerabilities** regularly

## Sensitive Fields

The following fields are automatically encrypted:
- `password` - User passwords
- `phone` - Phone numbers
- `email` - Email addresses
- `account_number` - Bank account numbers
- `bank` - Bank information
- `contact_info` - Contact information
- `address` - Physical addresses

## Testing

To test the security implementation:

1. **Test JWT validation**: Try accessing `/admin` without a token - should redirect to login
2. **Test encrypted storage**: Check localStorage - sensitive data should be encrypted
3. **Test API encryption**: Check network tab - sensitive fields in responses should be encrypted
4. **Test middleware**: Disable JavaScript - middleware should still block unauthorized access

## Troubleshooting

### Encryption Errors
- Ensure `NEXT_PUBLIC_ENCRYPTION_KEY` is set
- Check browser console for Web Crypto API errors
- Verify HTTPS is enabled in production

### JWT Validation Errors
- Ensure `JWT_SECRET` matches backend secret
- Check token expiration (30 minutes)
- Verify cookie is being set correctly

### API Route Errors
- Check `ENCRYPTION_SECRET` is set
- Verify backend API is accessible
- Check network tab for request/response errors

## Future Enhancements

Potential improvements:
1. Key rotation mechanism
2. Public key encryption for login credentials
3. Rate limiting on API routes
4. Request signing for additional security
5. Audit logging for sensitive operations

