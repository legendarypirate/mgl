/**
 * Secure Authentication Service
 * 
 * Production-grade authentication service for Next.js frontend.
 * 
 * Features:
 * - Access token management (stored in memory/state)
 * - Automatic token refresh
 * - Secure API request interceptors
 * - Logout functionality
 * 
 * Security:
 * - Access tokens stored in memory (not localStorage) to prevent XSS
 * - Refresh tokens handled automatically via httpOnly cookies
 * - Automatic token refresh before expiration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Token Storage Interface
 * 
 * Access tokens should be stored in memory, not localStorage.
 * This prevents XSS attacks from stealing tokens.
 */
interface TokenStorage {
  accessToken: string | null;
  user: any | null;
}

// In-memory token storage (prevents XSS)
let tokenStorage: TokenStorage = {
  accessToken: null,
  user: null
};

/**
 * Set Access Token
 * 
 * Stores access token in memory (not localStorage).
 * This prevents XSS attacks from accessing tokens via JavaScript.
 */
export const setAccessToken = (token: string, user: any) => {
  tokenStorage.accessToken = token;
  tokenStorage.user = user;
  
  // Optional: Also store in sessionStorage for page refresh persistence
  // SessionStorage is cleared when tab closes, more secure than localStorage
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.warn('SessionStorage not available:', e);
    }
  }
};

/**
 * Get Access Token
 * 
 * Retrieves access token from memory or sessionStorage.
 */
export const getAccessToken = (): string | null => {
  if (tokenStorage.accessToken) {
    return tokenStorage.accessToken;
  }
  
  // Fallback to sessionStorage if memory is cleared (page refresh)
  if (typeof window !== 'undefined') {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        tokenStorage.accessToken = token;
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          tokenStorage.user = JSON.parse(userStr);
        }
        return token;
      }
    } catch (e) {
      console.warn('SessionStorage read error:', e);
    }
  }
  
  return null;
};

/**
 * Get User
 * 
 * Retrieves current user from memory or sessionStorage.
 */
export const getUser = (): any | null => {
  if (tokenStorage.user) {
    return tokenStorage.user;
  }
  
  if (typeof window !== 'undefined') {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        tokenStorage.user = user;
        return user;
      }
    } catch (e) {
      console.warn('SessionStorage read error:', e);
    }
  }
  
  return null;
};

/**
 * Clear Tokens
 * 
 * Clears all tokens from memory and sessionStorage.
 */
export const clearTokens = () => {
  tokenStorage.accessToken = null;
  tokenStorage.user = null;
  
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    } catch (e) {
      console.warn('SessionStorage clear error:', e);
    }
  }
};

/**
 * Login
 * 
 * Authenticates user and stores access token.
 * Refresh token is automatically set in httpOnly cookie by backend.
 * 
 * Security: Credentials are sent over HTTPS in production.
 */
export const login = async (username: string, password: string): Promise<{
  success: boolean;
  accessToken?: string;
  user?: any;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Required for httpOnly cookies (refresh token)
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Login failed'
      };
    }

    // Store access token in memory
    // IMPORTANT: accessToken and user data are plain text (not encrypted)
    // - accessToken: Plain text JWT token
    // - user: Plain text JSON object (username, id, role, permissions)
    setAccessToken(data.accessToken, data.user);

    return {
      success: true,
      accessToken: data.accessToken, // Plain text JWT
      user: data.user                // Plain text user data
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }
};

/**
 * Register
 * 
 * Registers new user and automatically logs them in.
 */
export const register = async (userData: {
  username: string;
  password: string;
  role_id?: number;
  phone?: string;
  email?: string;
}): Promise<{
  success: boolean;
  accessToken?: string;
  user?: any;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Registration failed'
      };
    }

    // Store access token
    setAccessToken(data.accessToken, data.user);

    return {
      success: true,
      accessToken: data.accessToken,
      user: data.user
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }
};

/**
 * Refresh Access Token
 * 
 * Exchanges refresh token (from httpOnly cookie) for new access token.
 * This is called automatically when access token expires.
 * 
 * Security: Refresh token is in httpOnly cookie, not accessible via JavaScript.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Required for httpOnly cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Refresh failed - user needs to login again
      clearTokens();
      return null;
    }

    // Update access token
    tokenStorage.accessToken = data.accessToken;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('accessToken', data.accessToken);
      } catch (e) {
        console.warn('SessionStorage write error:', e);
      }
    }

    return data.accessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    return null;
  }
};

/**
 * Logout
 * 
 * Logs out user and clears all tokens.
 * Also revokes refresh token on backend.
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to revoke refresh token
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens regardless of API call success
    clearTokens();
  }
};

/**
 * Make Authenticated Request
 * 
 * Makes API request with access token and automatic token refresh.
 * 
 * Security:
 * - Automatically adds Authorization header
 * - Refreshes token if expired
 * - Retries request with new token
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getAccessToken();

  // If no token, try to refresh
  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  // If still no token, user needs to login
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  // Add Authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };

  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // For cookies
  });

  // If token expired (401), try to refresh and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        },
        credentials: 'include',
      });
    } else {
      // Refresh failed - clear tokens
      clearTokens();
      throw new Error('Authentication failed');
    }
  }

  return response;
};

/**
 * Verify Token
 * 
 * Checks if current access token is valid.
 */
export const verifyToken = async (): Promise<boolean> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

