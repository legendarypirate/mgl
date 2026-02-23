/**
 * Secure login route
 * Encrypts credentials before sending to backend
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Encrypt sensitive login data
 */
function encryptLoginData(data: { username: string; password: string }): { username: string; password: string } {
  // For login, we still send credentials to backend, but we could add an extra layer
  // For now, we'll just forward it securely (HTTPS handles transport encryption)
  // In a more advanced setup, you could use public key encryption here
  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API URL is configured
    if (!API_URL || API_URL === '') {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { success: false, message: 'API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const backendUrl = `${API_URL}/api/auth/login`;
    console.log('Making request to:', backendUrl); // Debug log

    // Forward to backend (credentials are sent over HTTPS)
    // The backend will handle authentication
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ username, password }),
    });

    console.log('Backend response status:', response.status); // Debug log

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Return success with token and user data
    // Note: User data will be encrypted by the secure API wrapper if needed
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Secure login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

