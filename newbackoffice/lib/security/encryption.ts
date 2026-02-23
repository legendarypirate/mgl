/**
 * Encryption utilities for securing sensitive data
 * Uses Web Crypto API for client-side encryption
 * Uses Node.js crypto for server-side encryption
 */

// Encryption key derivation - in production, this should come from environment variables
// For client-side, we derive a key from a passphrase stored securely
// For server-side, we use a secret key from environment

const getEncryptionKey = async (): Promise<CryptoKey> => {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  // In production, derive key from a secure passphrase or use a key management service
  const keyMaterial = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  
  // Derive a key using PBKDF2
  const encoder = new TextEncoder();
  const keyMaterialBuffer = encoder.encode(keyMaterial);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyMaterialBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = encoder.encode('secure-salt-change-in-production');
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt data on client-side
 */
export const encryptData = async (data: string): Promise<string> => {
  try {
    // Only run in browser
    if (typeof window === 'undefined') {
      return data; // Return as-is on server
    }

    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for transmission
    const binaryString = Array.from(combined, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Check if a string is valid base64
 */
const isValidBase64 = (str: string): boolean => {
  try {
    // Base64 strings should only contain A-Z, a-z, 0-9, +, /, and = (for padding)
    // They should also be a multiple of 4 in length (after padding)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str)) {
      return false;
    }
    
    // Try to decode it - if it fails, it's not valid base64
    atob(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Decrypt data on client-side
 */
export const decryptData = async (encryptedData: string): Promise<string> => {
  try {
    // Only run in browser
    if (typeof window === 'undefined') {
      return encryptedData; // Return as-is on server
    }

    // Validate input
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data: must be a non-empty string');
    }

    // Check if data is actually base64 encoded
    // If not, it might already be decrypted or in a different format
    if (!isValidBase64(encryptedData)) {
      // If it's not valid base64, it might be plaintext that was never encrypted
      // or it might be corrupted. Return as-is with a warning.
      console.warn('Data is not valid base64 - may not be encrypted:', encryptedData.substring(0, 50));
      return encryptedData;
    }

    const key = await getEncryptionKey();
    
    // Decode from base64 with error handling
    let binaryString: string;
    try {
      binaryString = atob(encryptedData);
    } catch (error) {
      throw new Error(`Invalid base64 encoding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate minimum length (should have IV + some encrypted data)
    if (binaryString.length < 13) {
      throw new Error('Encrypted data is too short to be valid');
    }

    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Validate encrypted data exists
    if (encrypted.length === 0) {
      throw new Error('No encrypted data found after IV');
    }
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // If decryption fails, it might be that the data was never encrypted
    // Return the original data instead of throwing to prevent breaking the app
    if (error instanceof Error && error.message.includes('Invalid base64')) {
      console.warn('Returning original data - may not be encrypted');
      return encryptedData;
    }
    throw new Error(`Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Encrypt sensitive fields in an object
 */
export const encryptSensitiveFields = async <T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[]
): Promise<T> => {
  const encrypted = { ...data };
  
  for (const field of sensitiveFields) {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      const value = String(encrypted[field]);
      encrypted[field] = (await encryptData(value)) as any;
    }
  }
  
  return encrypted;
};

/**
 * Decrypt sensitive fields in an object
 */
export const decryptSensitiveFields = async <T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[]
): Promise<T> => {
  const decrypted = { ...data };
  
  for (const field of sensitiveFields) {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      try {
        const value = String(decrypted[field]);
        
        // Skip if value is empty or doesn't look like encrypted data
        if (!value || value.trim().length === 0) {
          continue;
        }
        
        // Try to decrypt - if it fails, keep original value
        const decryptedValue = await decryptData(value);
        
        // Only update if decryption actually changed the value
        // (if it's not encrypted, decryptData returns the original)
        if (decryptedValue !== value) {
          decrypted[field] = decryptedValue as any;
        }
      } catch (error) {
        // If decryption fails, the field might not be encrypted
        // Keep original value - this is expected for unencrypted data
        console.debug(`Field ${String(field)} may not be encrypted, keeping original value`);
      }
    }
  }
  
  return decrypted;
};

/**
 * Hash data (one-way, for passwords)
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Server-side encryption using Node.js crypto
 * This is used in API routes
 */
export const serverEncrypt = (data: string, secretKey: string): string => {
  // This will be implemented in API routes using Node.js crypto
  // For now, return a placeholder
  return data;
};

export const serverDecrypt = (encryptedData: string, secretKey: string): string => {
  // This will be implemented in API routes using Node.js crypto
  return encryptedData;
};

