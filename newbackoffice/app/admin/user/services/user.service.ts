import { User, CreateUserPayload } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/user`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch users');
};

// Create user
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await fetch(`${API_URL}/api/user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  
  // Check if request was successful
  if (result.success && response.ok) {
    return result.data || result;
  }
  
  // Throw error with message from backend
  throw new Error(result.message || 'Failed to create user');
};

// Update user
export const updateUser = async (userId: number, payload: Partial<CreateUserPayload>): Promise<User> => {
  const response = await fetch(`${API_URL}/api/user/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  
  // Check if request was successful
  if (result.success && response.ok) {
    return result.data || result;
  }
  
  // Throw error with message from backend
  throw new Error(result.message || 'Failed to update user');
};

// Delete user
export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/user/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to delete user');
  }
};

