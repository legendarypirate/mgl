export interface Order {
  id: number;
  phone: string;
  address: string;
  status: number | string;
  comment: string;
  driver: {
    username: string;
  } | null;
  createdAt: string;
  merchant: {
    username: string;
  };
  status_name?: {
    status: string;
    color: string;
  };
}

export interface OrderStatus {
  id: number;
  label: string;
  color: string;
}

export interface User {
  id: number;
  username: string;
  phone?: string;
}

export interface OrderFilters {
  phone?: string;
  merchantId?: number;
  statusIds?: number[];
  startDate?: string;
  endDate?: string;
}

export interface OrderPagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface CreateOrderPayload {
  merchant_id: number;
  phone: string;
  address: string;
  status: number;
  comment: string;
}

export interface AllocateOrderPayload {
  driver_id: number;
  delivery_ids: (string | number)[];
}

