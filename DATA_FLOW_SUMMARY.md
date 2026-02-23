# Data Flow Summary - What Gets Encrypted/Decrypted

## Quick Answer

**The data you're seeing (long hash strings) are likely bcrypt password hashes, which are CORRECT and should NEVER be decrypted.**

## Data Types and Their Handling

### 1. Passwords ✅ (Hashed - Never Decrypted)

**Flow:**
```
User Input → bcrypt.hash() → Database (hashed)
User Login → bcrypt.compare(input, stored_hash) → true/false
```

**What you see:** Long strings like `$2a$10$4de268b8e1f3b471419c2775f69f6f49...`
**Status:** ✅ CORRECT - These are bcrypt hashes
**Action:** NEVER try to decrypt - only compare with `bcrypt.compare()`

### 2. Refresh Tokens ✅ (Plain Text - Not Encrypted)

**Flow:**
```
Backend: crypto.randomBytes(64) → Plain text token → Database (plain text)
Backend: Set in httpOnly cookie (plain text)
Frontend: Receives in cookie automatically (cannot access via JavaScript)
```

**What you see:** 128-character hex string (like `4de268b8e1f3b471419c2775f69f6f49...`)
**Status:** ✅ CORRECT - Stored as plain text for efficient lookup
**Action:** No encryption/decryption needed

### 3. Access Tokens ✅ (Plain Text JWT - Not Encrypted)

**Flow:**
```
Backend: jwt.sign() → Plain text JWT token
Backend: Return in JSON response
Frontend: Store in memory/sessionStorage (plain text)
Frontend: Send in Authorization header (plain text)
```

**What you see:** JWT token (like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
**Status:** ✅ CORRECT - JWT is signed (not encrypted)
**Action:** No decryption needed - just verify signature

### 4. User Data ✅ (Plain Text - Not Encrypted)

**Flow:**
```
Database: Plain text (username, email, role, etc.)
Backend: Return in JSON response (plain text)
Frontend: Store in memory/sessionStorage (plain text JSON)
```

**What you see:** JSON object like `{ id: 1, username: "user123", role: 1 }`
**Status:** ✅ CORRECT - Plain text for easy access
**Action:** No encryption/decryption needed

## The Hash Strings You're Seeing

If you're seeing strings like:
```
4de268b8e1f3b471419c2775f69f6f49:822eb6c6022e1fc3beb7f15a0007c649:...
```

These are likely:
1. **Bcrypt password hashes** - ✅ CORRECT (should never be decrypted)
2. **Multiple hashes concatenated** - Possibly from database queries

## Verification

### Backend Verification

Check your database:
```sql
-- Passwords should be hashed (bcrypt)
SELECT password FROM users LIMIT 1;
-- Should see: $2a$10$...

-- Refresh tokens should be plain text (128 hex chars)
SELECT token FROM refresh_tokens LIMIT 1;
-- Should see: 4de268b8e1f3b471419c2775f69f6f49... (128 chars)

-- User data should be plain text
SELECT username, email FROM users LIMIT 1;
-- Should see: user123, user@example.com
```

### Frontend Verification

Check browser storage:
```javascript
// Access token (plain text JWT)
sessionStorage.getItem('accessToken');
// Should see: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// User data (plain text JSON)
JSON.parse(sessionStorage.getItem('user'));
// Should see: { id: 1, username: "user123", role: 1 }
```

## Common Issues

### Issue 1: Trying to Decrypt Passwords
**Problem:** Passwords cannot be decrypted (bcrypt is one-way)
**Solution:** Use `bcrypt.compare()` instead

### Issue 2: Hashing Refresh Tokens
**Problem:** Refresh tokens are being hashed when they shouldn't be
**Solution:** Store refresh tokens as plain text (current implementation is correct)

### Issue 3: Encrypting User Data
**Problem:** User data is being encrypted when it shouldn't be
**Solution:** Return user data as plain text JSON

## Current Implementation Status

✅ **Passwords:** Hashed with bcrypt (correct)
✅ **Refresh Tokens:** Stored as plain text (correct)
✅ **Access Tokens:** Plain text JWT (correct)
✅ **User Data:** Plain text JSON (correct)

## If You Need to "Decrypt" Data

**You DON'T need to decrypt:**
- Passwords (use `bcrypt.compare()`)
- Refresh tokens (already plain text)
- Access tokens (already plain text JWT)
- User data (already plain text)

**If you're seeing hashed data and need plain text:**
1. Check if it's a password (should stay hashed)
2. Check if it's a refresh token (should be plain text in database)
3. Check if it's user data (should be plain text in database)

## Next Steps

1. Verify database: Check if refresh tokens are stored as plain text
2. Verify API responses: Check if user data is returned as plain text
3. Verify frontend: Check if data is stored as plain text JSON

If you're still seeing issues, please share:
- Where you're seeing the hashed data (database, API response, frontend?)
- What type of data it is (password, token, user data?)
- What you're trying to do with it

