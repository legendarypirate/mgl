# Quick Fix: Network Requests Not Showing

## Immediate Fix

### 1. Create Environment File

Create `.env.local` in `newbackoffice/` directory:

```bash
cd newbackoffice
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 2. Restart Next.js Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Verify Backend is Running

```bash
# In another terminal
cd delivery
node server.secure.js
# or if using old server
node server.js
```

### 4. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors
4. Try login again
5. Check Network tab - requests should appear now

## Why This Happens

The frontend uses Next.js API routes (`/api/secure/auth/login`) which proxy to the backend. If `NEXT_PUBLIC_API_URL` is not set:

1. The API route can't make the backend request
2. The request fails silently
3. No network request appears in the browser (because it fails server-side)

## Alternative: Direct Backend Calls

If you want to bypass Next.js API routes and call backend directly:

Update `app/page.tsx`:

```typescript
// Replace the fetch call with:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const response = await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify({ username, password }),
});
```

This will show requests directly in the Network tab.

## Still Not Working?

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check CORS settings:**
   - Backend `.env` should have: `ALLOWED_ORIGINS=http://localhost:3000`

3. **Check browser console:**
   - Look for CORS errors
   - Look for network errors

4. **Try direct backend call:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

