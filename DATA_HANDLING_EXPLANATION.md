# Data Handling Explanation

## Important: What Should and Shouldn't Be Decrypted

### ✅ Passwords - NEVER Decrypt (Hashed Only)

**Backend Storage:**
- Passwords are hashed with bcrypt (one-way encryption)
- **Cannot and should not be decrypted**
- Only compared using `bcrypt.compare()`

**Example:**
```javascript
// ✅ CORRECT: Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);
await User.create({ username, password: hashedPassword });

// ✅ CORRECT: Compare password (not decrypt)
const match = await bcrypt.compare(inputPassword, user.password);

// ❌ WRONG: Never try to decrypt password
// const decrypted = decrypt(user.password); // IMPOSSIBLE!
```

### ✅ Refresh Tokens - Plain Text (Not Hashed)

**Backend Storage:**
- Refresh tokens are stored as **plain text** in database
- They are cryptographically random (not guessable)
- Stored in httpOnly cookies (XSS protection)
- **No encryption/decryption needed**

**Example:**
```javascript
// ✅ CORRECT: Store as plain text
const refreshToken = crypto.randomBytes(64).toString('hex');
await RefreshToken.create({ token: refreshToken }); // Plain text

// ✅ CORRECT: Lookup by plain text
const token = await RefreshToken.findOne({ 
  where: { token: refreshTokenFromCookie } 
});
```

### ✅ User Data - Plain Text (Not Encrypted)

**Backend Storage:**
- Username, email, phone, etc. stored as **plain text**
- Sent to frontend as **plain text** in JSON
- **No encryption/decryption needed**

**Example:**
```javascript
// ✅ CORRECT: Return plain text user data
res.json({
  success: true,
  user: {
    id: user.id,
    username: user.username, // Plain text
    email: user.email,       // Plain text
    role: user.role_id        // Plain text
  }
});
```

## The Data You're Seeing

The long hash strings you're seeing (like `4de268b8e1f3b471419c2775f69f6f49:...`) are likely:

1. **Bcrypt password hashes** - These are CORRECT and should NEVER be decrypted
2. **Multiple concatenated hashes** - Possibly from database queries

## Fix: Ensure Proper Data Handling

### Backend Fix

1. **Passwords**: Already correct (hashed, never decrypted)
2. **Refresh Tokens**: Ensure stored as plain text
3. **User Data**: Ensure returned as plain text

### Frontend Fix

1. **Access Tokens**: Store in memory/sessionStorage (plain text)
2. **User Data**: Store as plain text JSON
3. **Never try to decrypt**: Passwords or tokens

## Verification Checklist

- [ ] Passwords are hashed (bcrypt) - ✅ Correct
- [ ] Passwords are NEVER decrypted - ✅ Correct
- [ ] Refresh tokens stored as plain text - ✅ Correct
- [ ] User data returned as plain text - ✅ Correct
- [ ] Access tokens stored in memory - ✅ Correct

