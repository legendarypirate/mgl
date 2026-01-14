import { GoodRequest, CreateGoodRequestPayload } from '../types/good-request';
import { Good } from '../../good/types/good';
import { Ware } from '../../good/types/good';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch requests (with optional merchant_id filter for merchants)
export const fetchGoodRequests = async (merchantId?: number): Promise<GoodRequest[]> => {
  let url = `${API_URL}/api/request`;
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
  throw new Error(result.message || 'Failed to fetch requests');
};

// Create request (for merchants)
export const createGoodRequest = async (payload: CreateGoodRequestPayload): Promise<GoodRequest> => {
  const response = await fetch(`${API_URL}/api/request/stock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: payload.type,
      amount: payload.amount,
      ware_id: payload.ware_id,
      merchant_id: payload.merchant_id,
      good_id: payload.good_id,
    }),
  });

  const result = await response.json();
  if (result.success || response.ok) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create request');
};

// Approve request (for admin)
export const approveRequest = async (requestId: number, stock?: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/request/approve/${requestId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(stock !== undefined ? { stock } : {}),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to approve request');
  }
};

// Decline request (for admin)
export const declineRequest = async (requestId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/request/decline/${requestId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success && !response.ok) {
    throw new Error(result.message || 'Failed to decline request');
  }
};

// Fetch goods (for merchant to select from)
export const fetchGoods = async (merchantId: number): Promise<Good[]> => {
  const response = await fetch(`${API_URL}/api/good?merchant_id=${merchantId}`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch goods');
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

