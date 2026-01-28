import {
  Order,
  User,
  OrderFilters,
  OrderPagination,
  CreateOrderPayload,
  AllocateOrderPayload,
} from '../types/order';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch orders with filters
export const fetchOrders = async (
  filters: OrderFilters,
  pagination: { current: number; pageSize: number },
  merchantId?: number
): Promise<{ data: Order[]; pagination: OrderPagination }> => {
  let url = `${API_URL}/api/order?page=${pagination.current}&limit=${pagination.pageSize}`;

  if (merchantId) {
    url += `&merchant_id=${merchantId}`;
  }
  if (filters.phone) {
    url += `&phone=${filters.phone}`;
  }
  if (filters.statusIds && filters.statusIds.length > 0) {
    url += `&status_ids=${filters.statusIds.join(',')}`;
  }
  if (filters.startDate) {
    url += `&start_date=${filters.startDate}`;
  }
  if (filters.endDate) {
    url += `&end_date=${filters.endDate}`;
  }

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return {
      data: result.data,
      pagination: result.pagination || {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: 0,
      },
    };
  }
  throw new Error(result.message || 'Failed to fetch orders');
};

// Create order
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await fetch(`${API_URL}/api/order`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create order');
};

// Allocate orders to driver
export const allocateOrders = async (payload: AllocateOrderPayload): Promise<void> => {
  const response = await fetch(`${API_URL}/api/order/allocate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      driver_id: payload.driver_id,
      delivery_ids: payload.delivery_ids,
    }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to allocate orders');
  }
};

// Fetch merchants
export const fetchMerchants = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/user/merchant`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error('Failed to fetch merchants');
};

// Fetch drivers
export const fetchDrivers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/user/drivers`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error('Failed to fetch drivers');
};

// Delete order
export const deleteOrder = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/order/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete order');
  }
};

