import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// JWT secret key - should match the backend secret key
// TODO: Move this to environment variable for better security
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for token in cookies (set during login)
    const token = request.cookies.get('token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Validate the JWT token server-side using jose (Edge-compatible)
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      // Token is valid, check if it has required fields
      if (!payload || !payload.id) {
        throw new Error('Invalid token payload');
      }
      
      // Token is valid, allow request to proceed
    } catch (error) {
      // Token is invalid, expired, or malformed
      // Clear the invalid token cookie and redirect to login
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      // Clear the invalid token cookie
      response.cookies.delete('token');
      
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

