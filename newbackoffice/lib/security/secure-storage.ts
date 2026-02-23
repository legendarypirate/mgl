/**
 * Secure storage utilities for encrypted localStorage
 */

import { encryptData, decryptData } from './encryption';

/**
 * Store encrypted data in localStorage
 */
export const setSecureItem = async (key: string, value: any): Promise<void> => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = await encryptData(stringValue);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Failed to store secure item ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve and decrypt data from localStorage
 * Handles both encrypted and unencrypted data for backward compatibility
 */
export const getSecureItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    // Try to decrypt - if it fails or returns the same value, it might not be encrypted
    let decrypted: string;
    try {
      decrypted = await decryptData(stored);
      
      // If decryption returned the same value, it wasn't encrypted
      // This is expected for backward compatibility with existing localStorage data
      if (decrypted === stored) {
        decrypted = stored;
      }
    } catch (error) {
      // If decryption fails completely, assume it's unencrypted data
      // This allows backward compatibility with existing localStorage
      console.debug(`Item ${key} may not be encrypted, using as-is`);
      decrypted = stored;
    }
    
    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as T;
    }
  } catch (error) {
    console.error(`Failed to retrieve secure item ${key}:`, error);
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const removeSecureItem = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * Clear all secure items
 */
export const clearSecureStorage = (): void => {
  // Clear sensitive keys
  const sensitiveKeys = ['token', 'user', 'permissions', 'role', 'username'];
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Migrate existing localStorage items to encrypted storage
 */
export const migrateToSecureStorage = async (): Promise<void> => {
  const keys = ['token', 'user', 'permissions', 'role', 'username'];
  
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        // Check if already encrypted (base64 pattern)
        const isEncrypted = /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 50;
        
        if (!isEncrypted) {
          // Migrate to encrypted storage
          await setSecureItem(key, value);
        }
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
      }
    }
  }
};

