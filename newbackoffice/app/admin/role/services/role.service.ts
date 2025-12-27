import { Role, Permission, UpdateRolePermissionsPayload } from '../types/role';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch roles
export const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${API_URL}/api/role`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch roles');
};

// Fetch permissions
export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await fetch(`${API_URL}/api/permission`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch permissions');
};

// Fetch role permissions
export const fetchRolePermissions = async (roleId: number): Promise<Permission[]> => {
  const response = await fetch(`${API_URL}/api/role_permission/${roleId}`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success && Array.isArray(result.data)) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch role permissions');
};

// Update role permissions
export const updateRolePermissions = async (
  roleId: number,
  payload: UpdateRolePermissionsPayload
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/role_permission/${roleId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to update role permissions');
  }
};

