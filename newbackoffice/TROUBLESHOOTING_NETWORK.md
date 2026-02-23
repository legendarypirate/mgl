# Troubleshooting: No Network Requests Showing

## Problem
Network tab is not showing any requests when trying to login or make API calls.

## Common Causes

### 1. Missing Environment Variable

**Issue:** `NEXT_PUBLIC_API_URL` is not set or empty.

**Check:**
```bash
# In newbackoffice directory
cat .env.local
# or
cat .env
```

**Fix:**
Create `.env.local` file in `newbackoffice/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 2. Backend Server Not Running

**Issue:** Backend server is not running on the configured port.

**Check:**
```bash
# Check if backend is running
curl http://localhost:3001/health
# or
curl http://localhost:3001/
```

**Fix:**
```bash
cd delivery
node server.secure.js
# or
npm run dev
```

### 3. CORS Configuration

**Issue:** CORS is blocking requests from frontend.

**Check:** Look for CORS errors in browser console.

**Fix:** Update `delivery/env.example`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Then in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Next.js API Route Failing Silently

**Issue:** The Next.js API route (`/api/secure/auth/login`) is failing before making the backend request.

**Check:**
- Open browser console
- Look for errors
- Check Next.js server logs

**Fix:**
- Check if `NEXT_PUBLIC_API_URL` is set
- Check if backend is accessible
- Check browser console for errors

### 5. Request Being Blocked

**Issue:** Browser or extension is blocking requests.

**Check:**
- Disable browser extensions
- Check browser console for errors
- Try incognito mode

## Debugging Steps

### Step 1: Check Environment Variables

```bash
cd newbackoffice
# Check if .env.local exists
ls -la .env*

# Check contents
cat .env.local
```

### Step 2: Check Backend Server

```bash
cd delivery
# Check if server is running
ps aux | grep node

# Start server if not running
node server.secure.js
```

### Step 3: Test Backend Directly

```bash
# Test backend health endpoint
curl http://localhost:3001/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Go to Network tab
5. Try login again
6. Check if requests appear

### Step 5: Check Next.js Logs

```bash
cd newbackoffice
npm run dev
# Watch for errors in terminal
```

## Quick Fix

### Option 1: Use Direct Backend Calls (Development)

Update `app/page.tsx` to call backend directly:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const response = await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify({ username, password }),
});
```

### Option 2: Fix Environment Variables

1. Create `.env.local` in `newbackoffice/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Restart Next.js dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Option 3: Check CORS

1. Update `delivery/.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

2. Restart backend server

## Verification

After fixing, verify:

1. **Backend is running:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy",...}
```

2. **Environment variable is set:**
```bash
cd newbackoffice
node -e "console.log(process.env.NEXT_PUBLIC_API_URL)"
# Should show: http://localhost:3001
```

3. **Network requests appear:**
- Open browser DevTools
- Go to Network tab
- Try login
- Should see request to `/api/secure/auth/login`

## Still Not Working?

1. **Check browser console** for JavaScript errors
2. **Check Next.js terminal** for server errors
3. **Check backend terminal** for API errors
4. **Try direct backend call** (bypass Next.js API route)
5. **Check firewall/antivirus** blocking requests

## Production Checklist

- [ ] `NEXT_PUBLIC_API_URL` is set in production environment
- [ ] Backend server is running and accessible
- [ ] CORS is configured for production domain
- [ ] HTTPS is enabled (if using secure cookies)
- [ ] Environment variables are set in deployment platform

