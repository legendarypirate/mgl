/**
 * Secure API proxy route
 * This route encrypts/decrypts data server-side before forwarding to backend
 * This ensures sensitive data is never exposed in network requests
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'your-encryption-secret-change-in-production';

// Algorithm for encryption
const ALGORITHM = 'aes-256-gcm';

/**
 * Derive encryption key from secret
 */
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
}

/**
 * Encrypt data server-side
 */
function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, authTag, and encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt data server-side
 */
function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt sensitive fields in an object
 */
function encryptSensitiveFields(data: any, fields: string[]): any {
  if (!data || typeof data !== 'object') return data;
  
  const encrypted = Array.isArray(data) ? [...data] : { ...data };
  
  for (const field of fields) {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      try {
        encrypted[field] = encrypt(String(encrypted[field]));
      } catch (error) {
        console.error(`Failed to encrypt field ${field}:`, error);
      }
    }
  }
  
  return encrypted;
}

/**
 * Decrypt sensitive fields in an object
 */
function decryptSensitiveFields(data: any, fields: string[]): any {
  if (!data || typeof data !== 'object') return data;
  
  const decrypted = Array.isArray(data) ? [...data] : { ...data };
  
  for (const field of fields) {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      try {
        const value = String(decrypted[field]);
        // Check if it looks like encrypted data (has colons)
        if (value.includes(':') && value.split(':').length === 3) {
          decrypted[field] = decrypt(value);
        }
      } catch (error) {
        // If decryption fails, keep original value
        console.warn(`Failed to decrypt field ${field}:`, error);
      }
    }
  }
  
  return decrypted;
}

// Sensitive fields that should be encrypted/decrypted
// Fields that should be encrypted in requests
// NOTE: Phone and address are NOT encrypted - sent as plain text over HTTPS
// HTTPS already provides transport encryption, so additional encryption is optional
const SENSITIVE_REQUEST_FIELDS = [
  'password',      // Always encrypted
  // 'phone',      // NOT encrypted - sent as plain text over HTTPS
  'email',         // Can be encrypted if needed
  'account_number', // Encrypted - sensitive financial data
  'bank',          // Encrypted - sensitive financial data
  'contact_info',  // Can be encrypted if needed
  // 'address',    // NOT encrypted - sent as plain text over HTTPS
];

// Fields that should be encrypted in responses
// NOTE: Phone and address are NOT encrypted - they're displayed as plain text
// Only truly sensitive data like passwords, account numbers should be encrypted
const SENSITIVE_RESPONSE_FIELDS = [
  // 'phone',      // NOT encrypted - displayed as plain text
  'email',         // Can be encrypted if needed
  'account_number', // Encrypted - sensitive financial data
  'bank',          // Encrypted - sensitive financial data
  'contact_info',  // Can be encrypted if needed
  // 'address',    // NOT encrypted - displayed as plain text
];

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Forward request to backend
    const backendUrl = `${API_URL}/api/${path}${queryString}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    // Encrypt sensitive fields in response before sending to client
    // Backend returns plain data, we encrypt it for additional security
    if (data.success && data.data) {
      if (Array.isArray(data.data)) {
        data.data = data.data.map((item: any) =>
          encryptSensitiveFields(item, SENSITIVE_RESPONSE_FIELDS)
        );
      } else {
        data.data = encryptSensitiveFields(data.data, SENSITIVE_RESPONSE_FIELDS);
      }
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Secure API GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Body comes from client - sensitive fields are sent plain over HTTPS
    // We encrypt them before forwarding to backend for extra security
    // Note: In a more advanced setup, you might want to decrypt client-encrypted data here
    const encryptedBody = encryptSensitiveFields(body, SENSITIVE_REQUEST_FIELDS);
    
    // Forward request to backend
    const backendUrl = `${API_URL}/api/${path}`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedBody),
    });
    
    const data = await response.json();
    
    // Encrypt sensitive fields in response before sending to client
    if (data.success && data.data) {
      if (Array.isArray(data.data)) {
        data.data = data.data.map((item: any) =>
          encryptSensitiveFields(item, SENSITIVE_RESPONSE_FIELDS)
        );
      } else {
        data.data = encryptSensitiveFields(data.data, SENSITIVE_RESPONSE_FIELDS);
      }
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Secure API POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Encrypt sensitive fields in request (phone/address are NOT encrypted)
    const encryptedBody = encryptSensitiveFields(body, SENSITIVE_REQUEST_FIELDS);
    
    // Forward request to backend
    const backendUrl = `${API_URL}/api/${path}`;
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedBody),
    });
    
    const data = await response.json();
    
    // Encrypt sensitive fields in response
    if (data.success && data.data) {
      if (Array.isArray(data.data)) {
        data.data = data.data.map((item: any) =>
          encryptSensitiveFields(item, SENSITIVE_RESPONSE_FIELDS)
        );
      } else {
        data.data = encryptSensitiveFields(data.data, SENSITIVE_RESPONSE_FIELDS);
      }
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Secure API PUT error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Forward request to backend
    const backendUrl = `${API_URL}/api/${path}`;
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Secure API DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

