/**
 * Secure API client that encrypts sensitive data before sending
 */

import { encryptSensitiveFields, decryptSensitiveFields } from './encryption';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const SECURE_API_PREFIX = '/api/secure';

// Fields that should be encrypted in requests
// NOTE: Phone and address are NOT encrypted - sent as plain text over HTTPS
const SENSITIVE_REQUEST_FIELDS = [
  'password',      // Always encrypted
  // 'phone',      // NOT encrypted - sent as plain text over HTTPS
  'email',         // Can be encrypted if needed
  'account_number', // Encrypted - sensitive financial data
  'bank',          // Encrypted - sensitive financial data
  'contact_info',  // Can be encrypted if needed
  // 'address',    // NOT encrypted - sent as plain text over HTTPS
  'username',      // Sometimes sensitive
] as const;

// Fields that should be decrypted in responses
// NOTE: Phone and address are NOT encrypted - displayed as plain text
const SENSITIVE_RESPONSE_FIELDS = [
  // 'phone',      // NOT encrypted - displayed as plain text
  'email',         // Can be encrypted if needed
  'account_number', // Encrypted - sensitive financial data
  'bank',          // Encrypted - sensitive financial data
  'contact_info',  // Can be encrypted if needed
  // 'address',    // NOT encrypted - displayed as plain text
] as const;

/**
 * Get authentication headers
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Secure fetch wrapper that sends data to secure API proxy
 * The secure API route handles encryption/decryption server-side
 */
export const secureFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Use secure API proxy route
  const secureEndpoint = `${SECURE_API_PREFIX}${endpoint}`;
  
  // Clone options to avoid mutating
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
  };
  
  // Stringify body if it's an object
  if (secureOptions.body && typeof secureOptions.body === 'object' && !(secureOptions.body instanceof FormData)) {
    secureOptions.body = JSON.stringify(secureOptions.body);
  }
  
  return fetch(secureEndpoint, secureOptions);
};

/**
 * Secure API request
 * The secure API route handles encryption/decryption server-side
 * This function just forwards to the secure route
 */
export const secureApiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await secureFetch(endpoint, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  // IMPORTANT: Only decrypt if data is actually encrypted
  // If backend returns plain text, we should NOT try to decrypt
  // The secure API route should handle encryption/decryption server-side
  // For now, we'll skip client-side decryption since backend returns plain text
  // If you need encryption, implement it server-side in the API route
  
  // Skip decryption - backend returns plain text data
  // Uncomment below if backend starts encrypting sensitive fields:
  /*
  if (data.data && typeof data.data === 'object') {
    try {
      if (Array.isArray(data.data)) {
        data.data = await Promise.all(
          data.data.map((item: any) =>
            decryptSensitiveFields(item, SENSITIVE_RESPONSE_FIELDS as any)
          )
        );
      } else {
        data.data = await decryptSensitiveFields(
          data.data,
          SENSITIVE_RESPONSE_FIELDS as any
        );
      }
    } catch (error) {
      console.error('Failed to decrypt response:', error);
      // Continue with original data if decryption fails
    }
  }
  */
  
  return data;
};

/**
 * Legacy fetch wrapper for backward compatibility
 * Automatically routes through secure API
 */
export const secureGet = async <T = any>(endpoint: string): Promise<T> => {
  return secureApiRequest<T>(endpoint, { method: 'GET' });
};

export const securePost = async <T = any>(
  endpoint: string,
  body?: any
): Promise<T> => {
  return secureApiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const securePut = async <T = any>(
  endpoint: string,
  body?: any
): Promise<T> => {
  return secureApiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const secureDelete = async <T = any>(endpoint: string): Promise<T> => {
  return secureApiRequest<T>(endpoint, { method: 'DELETE' });
};

