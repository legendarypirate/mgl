import { Delivery, DeliveryItem } from '../../delivery/types/delivery';

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

// Product report data interface
export interface ProductReportItem {
  productId: number;
  productName: string;
  merchantId: number;
  merchantName: string;
  totalQuantity: number;
  totalCount: number; // Number of deliveries containing this product
  totalPrice: number; // Total price of deliveries containing this product
  deliveryDate?: string; // Delivery date (if all deliveries have the same date, or first delivery date)
}

// Product report response interface
export interface ProductReportResponse {
  items: ProductReportItem[];
  uniqueDeliveryTotal: number; // Sum of unique delivery prices
}

// Fetch product report data
export const fetchProductReport = async (
  filters: {
    startDate?: string;
    endDate?: string;
    merchantId?: number;
    productName?: string;
  }
): Promise<ProductReportResponse> => {
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }

  // First, fetch merchants to create a lookup map for merchant_id
  let merchantMap = new Map<string, number>();
  try {
    const merchantsResponse = await fetch(`${API_URL}/api/user/merchant`, {
      headers: getAuthHeaders(),
    });
    if (merchantsResponse.ok) {
      const merchantsResult = await merchantsResponse.json();
      if (merchantsResult.success && Array.isArray(merchantsResult.data)) {
        merchantsResult.data.forEach((merchant: any) => {
          if (merchant.username && merchant.id) {
            merchantMap.set(merchant.username, merchant.id);
          }
        });
      }
    }
  } catch (error) {
    console.warn('Failed to fetch merchants for lookup:', error);
  }

  // Fetch only deliveries with status 3
  let url = `${API_URL}/api/delivery?page=1&limit=10000`;
  if (filters.merchantId) url += `&merchant_id=${filters.merchantId}`;
  if (filters.startDate) url += `&start_date=${filters.startDate}`;
  if (filters.endDate) url += `&end_date=${filters.endDate}`;
  url += `&status_ids=3`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch deliveries');
    }

    const deliveries: Delivery[] = result.data || [];
    
    // Fetch items for all deliveries
    const productMap = new Map<string, ProductReportItem>();
    // Track which deliveries we've already counted for each product
    const deliveryCountedMap = new Map<string, Set<number>>();
    // Track unique deliveries and their prices for correct total calculation
    const uniqueDeliveries = new Map<number, { price: number; deliveryDate?: string }>();
    
    for (const delivery of deliveries) {
      // Track unique deliveries for total calculation
      if (!uniqueDeliveries.has(delivery.id)) {
        uniqueDeliveries.set(delivery.id, {
          price: parseFloat(delivery.price?.toString() || '0'),
          deliveryDate: delivery.delivery_date || undefined,
        });
      }
      
      try {
        const itemsResponse = await fetch(`${API_URL}/api/delivery/${delivery.id}/items`, {
          headers: getAuthHeaders(),
        });

        if (itemsResponse.ok) {
          const itemsResult = await itemsResponse.json();
          if (itemsResult.success && Array.isArray(itemsResult.data)) {
            const items: DeliveryItem[] = itemsResult.data;
            
            for (const item of items) {
              // Filter by product name if provided
              if (filters.productName && 
                  !item.good?.name?.toLowerCase().includes(filters.productName.toLowerCase())) {
                continue;
              }

              const productId = item.good_id;
              const productName = item.good?.name || 'Unknown';
              const merchantName = delivery.merchant?.username || 'Unknown';
              const merchantId = merchantMap.get(merchantName) || filters.merchantId || 0;
              
              // Use productId and merchantId as key for grouping
              const key = `${productId}-${merchantId}`;
              
              if (!productMap.has(key)) {
                productMap.set(key, {
                  productId,
                  productName,
                  merchantId,
                  merchantName,
                  totalQuantity: 0,
                  totalCount: 0,
                  totalPrice: 0,
                  deliveryDate: undefined,
                });
                deliveryCountedMap.set(key, new Set());
              }

              const reportItem = productMap.get(key)!;
              const countedDeliveries = deliveryCountedMap.get(key)!;
              
              // Add quantity
              reportItem.totalQuantity += item.quantity;
              
              // Count delivery only once per product
              if (!countedDeliveries.has(delivery.id)) {
                reportItem.totalCount += 1;
                reportItem.totalPrice += parseFloat(delivery.price?.toString() || '0');
                // Store delivery date (use first one if multiple)
                if (!reportItem.deliveryDate && delivery.delivery_date) {
                  reportItem.deliveryDate = delivery.delivery_date;
                }
                countedDeliveries.add(delivery.id);
              }
            }
          }
        }
      } catch (error) {
        // Skip deliveries where items can't be fetched
        console.warn(`Failed to fetch items for delivery ${delivery.id}:`, error);
      }
    }

    // Calculate total price as sum of unique delivery prices
    const totalUniquePrice = Array.from(uniqueDeliveries.values()).reduce(
      (sum, delivery) => sum + delivery.price,
      0
    );
    
    const resultItems = Array.from(productMap.values());
    
    return {
      items: resultItems,
      uniqueDeliveryTotal: totalUniquePrice,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch product report data.');
  }
};

