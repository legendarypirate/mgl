export interface Good {
  id: number;
  stock: number;
  in_delivery: number;
  delivered: number;
  name: string;
  merchant_id: number;
  ware_id: number;
  createdAt: string;
  updatedAt: string;
  merchant: {
    id: number;
    username: string;
  };
  ware: {
    id: number;
    name: string;
  };
}

export interface GoodHistory {
  id: number;
  good_id: number;
  type: number; // 1: Admin income, 2: Admin expense, 3: Delivery created, 4: Delivery cancelled, 5: Delivery completed
  amount: number;
  delivery_id: number | null;
  user_id: number | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
  } | null;
  delivery?: {
    id: number;
    delivery_id: string;
    status: number;
  } | null;
}

export interface Merchant {
  id: number;
  username: string;
  role_id?: number;
}

export interface Ware {
  id: number;
  name: string;
}

export interface CreateGoodPayload {
  name: string;
  stock: number;
  merchant_id: number;
  ware_id: number;
}

export interface UpdateStockPayload {
  id: number;
  type: number; // 1 for income, 2 for expense
  amount: number;
}

