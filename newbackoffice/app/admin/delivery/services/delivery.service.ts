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
  Region,
} from '../types/delivery';
import { secureGet, securePost, securePut, secureDelete } from '@/lib/security/secure-api';

// Fetch deliveries with filters (sensitive data automatically encrypted/decrypted)
export const fetchDeliveries = async (
  filters: DeliveryFilters,
  pagination: { current: number; pageSize: number }
): Promise<{ data: Delivery[]; pagination: DeliveryPagination }> => {
  let queryParams = `?page=${pagination.current}&limit=${pagination.pageSize}`;

  if (filters.merchantId) queryParams += `&merchant_id=${filters.merchantId}`;
  if (filters.driverId) queryParams += `&driver_id=${filters.driverId}`;
  if (filters.districtId) queryParams += `&dist_id=${filters.districtId}`;
  if (filters.phone) queryParams += `&phone=${filters.phone}`;
  if (filters.statusIds && filters.statusIds.length > 0) {
    queryParams += `&status_ids=${filters.statusIds.join(',')}`;
  }
  if (filters.startDate) queryParams += `&start_date=${filters.startDate}`;
  if (filters.endDate) queryParams += `&end_date=${filters.endDate}`;

  const result = await secureGet<{ success: boolean; data: Delivery[]; pagination: DeliveryPagination; message?: string }>(
    `/delivery${queryParams}`
  );

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
  const result = await secureGet<{ success: boolean; data: DeliveryItem[]; message?: string }>(
    `/delivery/${deliveryId}/items`
  );

  if (result.success && Array.isArray(result.data)) {
    return result.data;
  }
  throw new Error(result.message || 'Invalid data format received');
};

// Fetch delivery history
export const fetchDeliveryHistory = async (deliveryId: number): Promise<DeliveryHistory[]> => {
  const result = await secureGet<{ success: boolean; data: DeliveryHistory[]; message?: string }>(
    `/delivery/${deliveryId}/history`
  );

  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to load delivery history');
};

// Create delivery (sensitive fields automatically encrypted)
export const createDelivery = async (payload: CreateDeliveryPayload): Promise<Delivery> => {
  const result = await securePost<{ success: boolean; data: Delivery; message?: string }>('/delivery', payload);
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create delivery');
};

// Update delivery (sensitive fields automatically encrypted)
export const updateDelivery = async (
  deliveryId: number,
  payload: UpdateDeliveryPayload
): Promise<Delivery> => {
  const result = await securePut<{ success: boolean; data: Delivery; message?: string }>(`/delivery/${deliveryId}`, payload);
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to update delivery');
};

// Delete multiple deliveries
export const deleteDeliveries = async (ids: React.Key[]): Promise<void> => {
  const result = await securePost<{ success: boolean; message?: string }>('/delivery/delete-multiple', { ids });

  if (!result.success) {
    throw new Error(result.message || 'Failed to delete deliveries');
  }
};

// Allocate deliveries to driver
export const allocateDeliveries = async (driverId: number, deliveryIds: React.Key[]): Promise<void> => {
  const result = await securePost<{ success: boolean; message?: string }>('/delivery/allocate', {
    driver_id: driverId,
    delivery_ids: deliveryIds,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to allocate deliveries');
  }
};

// Change delivery status
export const changeDeliveryStatus = async (
  statusId: number,
  deliveryIds: React.Key[]
): Promise<void> => {
  const result = await securePost<{ success: boolean; message?: string }>('/delivery/status', {
    status_id: statusId,
    delivery_ids: deliveryIds,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to change delivery status');
  }
};

// Update delivery dates in bulk
export const updateDeliveryDates = async (
  deliveryDate: string,
  deliveryIds: React.Key[]
): Promise<void> => {
  const result = await securePost<{ success: boolean; message?: string }>('/delivery/update-delivery-dates', {
    delivery_date: deliveryDate,
    delivery_ids: deliveryIds,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to update delivery dates');
  }
};

// Fetch merchants
export const fetchMerchants = async (): Promise<User[]> => {
  const result = await secureGet<{ success: boolean; data: User[]; message?: string }>('/user/merchant');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch merchants');
};

// Fetch drivers
export const fetchDrivers = async (): Promise<User[]> => {
  const result = await secureGet<{ success: boolean; data: User[]; message?: string }>('/user/drivers');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch drivers');
};

// Fetch statuses
export const fetchStatuses = async (): Promise<DeliveryStatus[]> => {
  const result = await secureGet<{ success: boolean; data: DeliveryStatus[]; message?: string }>('/status');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch statuses');
};

// Fetch regions
export const fetchRegions = async (): Promise<Region[]> => {
  const result = await secureGet<{ success: boolean; data: Region[]; message?: string }>('/region');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch regions');
};

// Fetch products/goods
export const fetchProducts = async (merchantId: number): Promise<Array<{ id: string; name: string; stock: number }>> => {
  const result = await secureGet<{ success: boolean; data: any[]; message?: string }>(`/good?merchant_id=${merchantId}`);
  
  if (result.success) {
    return result.data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      stock: item.stock || 0,
    }));
  }
  throw new Error(result.message || 'Failed to fetch products');
};

// Import deliveries from Excel
export const importDeliveries = async (deliveries: any[]): Promise<{ inserted?: number }> => {
  const result = await securePost<{ success: boolean; inserted?: number; message?: string }>('/delivery/import', { deliveries });
  
  if (result.success) {
    return result;
  }
  throw new Error(result.message || 'Import failed');
};

// Update delivery item
export const updateDeliveryItem = async (
  deliveryId: number,
  itemId: number,
  quantity: number
): Promise<DeliveryItem> => {
  const result = await securePut<{ success: boolean; data: DeliveryItem; message?: string }>(
    `/delivery/${deliveryId}/items/${itemId}`,
    { quantity }
  );
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to update delivery item');
};

// Delete delivery item
export const deleteDeliveryItem = async (
  deliveryId: number,
  itemId: number
): Promise<void> => {
  const result = await secureDelete<{ success: boolean; message?: string }>(`/delivery/${deliveryId}/items/${itemId}`);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete delivery item');
  }
};

