import { User, CreateUserPayload } from '../types/user';
import { secureGet, securePost, securePut, secureDelete } from '@/lib/security/secure-api';

// Fetch users (sensitive data is automatically encrypted/decrypted)
export const fetchUsers = async (): Promise<User[]> => {
  const result = await secureGet<{ success: boolean; data: User[]; message?: string }>('/user');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch users');
};

// Create user (sensitive fields are automatically encrypted)
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const result = await securePost<{ success: boolean; data: User; message?: string }>('/user', payload);
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.message || 'Failed to create user');
};

// Update user (sensitive fields are automatically encrypted)
export const updateUser = async (userId: number, payload: Partial<CreateUserPayload>): Promise<User> => {
  const result = await securePut<{ success: boolean; data: User; message?: string }>(`/user/${userId}`, payload);
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.message || 'Failed to update user');
};

// Delete user
export const deleteUser = async (userId: number): Promise<void> => {
  const result = await secureDelete<{ success: boolean; message?: string }>(`/user/${userId}`);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete user');
  }
};

