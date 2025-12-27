import { Status, CreateStatusPayload } from '../types/status';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch statuses
export const fetchStatuses = async (): Promise<Status[]> => {
  const response = await fetch(`${API_URL}/api/status`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch statuses');
};

// Create status
export const createStatus = async (payload: CreateStatusPayload): Promise<Status> => {
  const response = await fetch(`${API_URL}/api/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success || response.ok) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create status');
};

// Delete status
export const deleteStatus = async (statusId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/status/${statusId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to delete status');
  }
};

