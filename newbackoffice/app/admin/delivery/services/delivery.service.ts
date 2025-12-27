import {
  Delivery,
  DeliveryHistory,
  DeliveryStatus,
  User,
  DeliveryFilters,
  DeliveryPagination,
  CreateDeliveryPayload,
  UpdateDeliveryPayload,
  DeliveryItem,
} from '../types/delivery';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch deliveries with filters
export const fetchDeliveries = async (
  filters: DeliveryFilters,
  pagination: { current: number; pageSize: number }
): Promise<{ data: Delivery[]; pagination: DeliveryPagination }> => {
  let url = `${API_URL}/api/delivery?page=${pagination.current}&limit=${pagination.pageSize}`;

  if (filters.merchantId) url += `&merchant_id=${filters.merchantId}`;
  if (filters.driverId) url += `&driver_id=${filters.driverId}`;
  if (filters.districtId) url += `&dist_id=${filters.districtId}`;
  if (filters.phone) url += `&phone=${filters.phone}`;
  if (filters.statusIds && filters.statusIds.length > 0) {
    url += `&status_ids=${filters.statusIds.join(',')}`;
  }
  if (filters.startDate) url += `&start_date=${filters.startDate}`;
  if (filters.endDate) url += `&end_date=${filters.endDate}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return {
      data: result.data,
      pagination: result.pagination || { current: pagination.current, pageSize: pagination.pageSize, total: 0 },
    };
  }
  throw new Error(result.message || 'Failed to fetch deliveries');
};

// Fetch delivery items
export const fetchDeliveryItems = async (deliveryId: number): Promise<DeliveryItem[]> => {
  const response = await fetch(`${API_URL}/api/delivery/${deliveryId}/items`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error fetching items: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && Array.isArray(data.data)) {
    return data.data;
  }
  throw new Error('Invalid data format received');
};

// Fetch delivery history
export const fetchDeliveryHistory = async (deliveryId: number): Promise<DeliveryHistory[]> => {
  const response = await fetch(`${API_URL}/api/delivery/${deliveryId}/history`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to load delivery history');
};

// Create delivery
export const createDelivery = async (payload: CreateDeliveryPayload): Promise<Delivery> => {
  const response = await fetch(`${API_URL}/api/delivery`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create delivery');
};

// Update delivery
export const updateDelivery = async (
  deliveryId: number,
  payload: UpdateDeliveryPayload
): Promise<Delivery> => {
  const response = await fetch(`${API_URL}/api/delivery/${deliveryId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to update delivery');
};

// Delete multiple deliveries
export const deleteDeliveries = async (ids: React.Key[]): Promise<void> => {
  const response = await fetch(`${API_URL}/api/delivery/delete-multiple`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || 'Failed to delete deliveries');
  }
};

// Allocate deliveries to driver
export const allocateDeliveries = async (driverId: number, deliveryIds: React.Key[]): Promise<void> => {
  const response = await fetch(`${API_URL}/api/delivery/allocate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      driver_id: driverId,
      delivery_ids: deliveryIds,
    }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to allocate deliveries');
  }
};

// Change delivery status
export const changeDeliveryStatus = async (
  statusId: number,
  deliveryIds: React.Key[]
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/delivery/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status_id: statusId,
      delivery_ids: deliveryIds,
    }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to change delivery status');
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

// Fetch statuses
export const fetchStatuses = async (): Promise<DeliveryStatus[]> => {
  const response = await fetch(`${API_URL}/api/status`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error('Failed to fetch statuses');
};

// Fetch products/goods
export const fetchProducts = async (merchantId: number): Promise<Array<{ id: string; name: string }>> => {
  const response = await fetch(`${API_URL}/api/good?merchant_id=${merchantId}`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
    }));
  }
  throw new Error('Failed to fetch products');
};

// Import deliveries from Excel
export const importDeliveries = async (deliveries: any[]): Promise<{ inserted?: number }> => {
  const response = await fetch(`${API_URL}/api/delivery/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ deliveries }),
  });

  const result = await response.json();
  if (result.success) {
    return result;
  }
  throw new Error(result.message || 'Import failed');
};

