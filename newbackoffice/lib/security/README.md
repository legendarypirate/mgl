# Security Implementation

This directory contains security utilities for encrypting sensitive data in the newbackoffice application.

## Overview

The security implementation provides:
1. **Client-side encryption** - Encrypts sensitive data before sending to server
2. **Server-side encryption** - Encrypts sensitive data in API responses
3. **Secure storage** - Encrypted localStorage for sensitive data
4. **Secure API proxy** - Routes that encrypt/decrypt data server-side

## Files

### `encryption.ts`
- Client-side encryption/decryption using Web Crypto API
- AES-GCM encryption with PBKDF2 key derivation
- Functions for encrypting/decrypting sensitive fields in objects

### `secure-storage.ts`
- Encrypted localStorage wrapper
- Automatically encrypts data before storing
- Automatically decrypts data when retrieving

### `secure-api.ts`
- Secure API client that automatically encrypts sensitive fields
- Wraps fetch calls to use secure API routes
- Automatically decrypts sensitive fields in responses

## Usage

### Encrypting Sensitive Data

```typescript
import { encryptSensitiveFields } from '@/lib/security/encryption';

const userData = {
  username: 'john',
  password: 'secret123',
  phone: '1234567890'
};

const encrypted = await encryptSensitiveFields(userData, ['password', 'phone']);
```

### Using Secure Storage

```typescript
import { setSecureItem, getSecureItem } from '@/lib/security/secure-storage';

// Store encrypted
await setSecureItem('token', 'my-token');
await setSecureItem('user', { id: 1, name: 'John' });

// Retrieve decrypted
const token = await getSecureItem<string>('token');
const user = await getSecureItem<User>('user');
```

### Using Secure API

```typescript
import { securePost, secureGet } from '@/lib/security/secure-api';

// Sensitive fields are automatically encrypted
const result = await securePost('/user', {
  username: 'john',
  password: 'secret',
  phone: '1234567890'
});

// Sensitive fields in response are automatically decrypted
const users = await secureGet<User[]>('/user');
```

## Environment Variables

Set these in your `.env.local`:

```env
# Encryption key for client-side encryption
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key-here

# Encryption secret for server-side encryption (in API routes)
ENCRYPTION_SECRET=your-server-encryption-secret-here

# JWT secret (should match backend)
JWT_SECRET=your-jwt-secret-here
```

## Security Considerations

1. **Never commit encryption keys to version control**
2. **Use strong, randomly generated keys in production**
3. **Rotate keys periodically**
4. **Use HTTPS in production** (encryption keys are still needed for additional security layer)
5. **Consider using a key management service** for production deployments

## Sensitive Fields

The following fields are automatically encrypted:
- `password`
- `phone`
- `email`
- `account_number`
- `bank`
- `contact_info`
- `address`

You can customize this list in `secure-api.ts`.

