export type Status = {
  id: number;
  status: string;
  color: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch all statuses
export const fetchStatuses = async (): Promise<Status[]> => {
  const response = await fetch(`${API_URL}/api/status`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error('Failed to fetch statuses');
};

// Fetch delivery status counts
export const fetchDeliveryStatusCounts = async (
  merchantId: number | null
): Promise<Record<number, number>> => {
  let url = `${API_URL}/api/delivery/delivery-status-counts`;
  if (merchantId) {
    url += `?merchant_id=${merchantId}`;
  }

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (result.success) {
    return result.data || {};
  }
  throw new Error('Failed to fetch delivery status counts');
};

