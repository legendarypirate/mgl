export interface Good {
  name: string;
}

export interface DeliveryItem {
  id: number;
  good_id: number;
  quantity: number;
  good?: Good;
}

export interface DeliveryHistory {
  id: number;
  merchant_id: number;
  delivery_id: number;
  driver_id: number | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  driver: {
    id: number;
    username: string;
    phone: string;
  } | null;
  status_name: {
    id: number;
    status: string;
    color: string;
  };
}

export interface Delivery {
  id: number;
  phone: string;
  address: string;
  status: number | string;
  price: number;
  comment: string;
  driver_comment: string;
  driver: {
    username: string;
  } | null;
  createdAt: string;
  delivered_at?: string;
  delivery_date?: string;
  merchant: {
    username: string;
  };
  status_name: {
    status: string;
    color: string;
  };
  items?: DeliveryItem[];
  is_paid: boolean;
  is_rural: boolean;
}

export interface DeliveryStatus {
  id: number;
  status: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface User {
  id: number;
  username: string;
  phone?: string;
}

export interface District {
  id: number;
  name: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface DeliveryFilters {
  phone?: string;
  merchantId?: number;
  driverId?: number;
  districtId?: number;
  statusIds?: number[];
  startDate?: string;
  endDate?: string;
}

export interface DeliveryPagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface CreateDeliveryPayload {
  merchant_id: number;
  phone: string;
  address: string;
  status: number;
  dist_id: number;
  is_paid: boolean;
  is_rural: boolean;
  price: number;
  comment: string;
  delivery_date?: string;
  items: Array<{
    good_id: string;
    quantity: number;
  }>;
}

export interface UpdateDeliveryPayload {
  phone: string;
  address: string;
  price: number;
  delivery_date?: string;
}

