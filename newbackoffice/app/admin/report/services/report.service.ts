import { Delivery } from '../../delivery/types/delivery';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Order type for orders table
export interface Order {
  id: number;
  merchant_id: number;
  driver_id: number | null;
  status: number;
  merchant?: {
    username: string;
  };
  driver?: {
    username: string;
  };
}

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch deliveries with filters for report
export const fetchReportDeliveries = async (
  filters: {
    startDate?: string;
    endDate?: string;
    driverId?: number;
    merchantId?: number;
  }
): Promise<Delivery[]> => {
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }

  let url = `${API_URL}/api/delivery?page=1&limit=10000`; // Large limit to get all deliveries

  if (filters.driverId) url += `&driver_id=${filters.driverId}`;
  if (filters.merchantId) url += `&merchant_id=${filters.merchantId}`;
  if (filters.startDate) url += `&start_date=${filters.startDate}`;
  if (filters.endDate) url += `&end_date=${filters.endDate}`;
  // Filter by status 3 (delivered) and status 5 (хаягаар очсон)
  url += `&status_ids=3,5`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data || [];
    }
    throw new Error(result.message || 'Failed to fetch deliveries');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch deliveries. Please check your connection and API server.');
  }
};

// Fetch orders with status 3 from orders table
export const fetchReportOrders = async (
  filters: {
    startDate?: string;
    endDate?: string;
    driverId?: number;
    merchantId?: number;
  }
): Promise<Order[]> => {
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }

  let url = `${API_URL}/api/order?page=1&limit=10000`; // Large limit to get all orders
  url += `&status_ids=3`; // Only status 3

  if (filters.driverId) url += `&driver_id=${filters.driverId}`;
  if (filters.merchantId) url += `&merchant_id=${filters.merchantId}`;
  if (filters.startDate) url += `&start_date=${filters.startDate}`;
  if (filters.endDate) url += `&end_date=${filters.endDate}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data || [];
    }
    throw new Error(result.message || 'Failed to fetch orders');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch orders. Please check your connection and API server.');
  }
};

