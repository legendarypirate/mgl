import { Warehouse, CreateWarehousePayload } from '../types/warehouse';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch warehouses
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const response = await fetch(`${API_URL}/api/ware`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch warehouses');
};

// Create warehouse
export const createWarehouse = async (payload: CreateWarehousePayload): Promise<Warehouse> => {
  const response = await fetch(`${API_URL}/api/ware`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success || response.ok) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create warehouse');
};

// Delete warehouse
export const deleteWarehouse = async (warehouseId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/ware/${warehouseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to delete warehouse');
  }
};

