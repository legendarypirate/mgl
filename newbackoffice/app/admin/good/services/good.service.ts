import { Good, Merchant, Ware, CreateGoodPayload, UpdateStockPayload, GoodHistory } from '../types/good';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch goods
export const fetchGoods = async (merchantId?: number): Promise<Good[]> => {
  let url = `${API_URL}/api/good`;
  if (merchantId) {
    url += `?merchant_id=${merchantId}`;
  }

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch goods');
};

// Fetch merchants
export const fetchMerchants = async (): Promise<Merchant[]> => {
  const response = await fetch(`${API_URL}/api/user`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data.filter((u: any) => u.role_id === 2);
  }
  throw new Error('Failed to fetch merchants');
};

// Fetch wares
export const fetchWares = async (): Promise<Ware[]> => {
  const response = await fetch(`${API_URL}/api/ware`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error('Failed to fetch wares');
};

// Create good
export const createGood = async (payload: CreateGoodPayload): Promise<Good> => {
  const response = await fetch(`${API_URL}/api/good`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success || response.ok) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create good');
};

// Delete good
export const deleteGood = async (goodId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/good/${goodId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to delete good');
  }
};

// Update stock
export const updateStock = async (payload: UpdateStockPayload): Promise<Good> => {
  const response = await fetch(`${API_URL}/api/good/${payload.id}/stock`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id: payload.id,
      type: payload.type,
      amount: Number(payload.amount),
    }),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to update stock');
};

// Fetch good history
export const fetchGoodHistory = async (goodId: number): Promise<GoodHistory[]> => {
  const response = await fetch(`${API_URL}/api/good/${goodId}/history`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch good history');
};

