export interface Warehouse {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehousePayload {
  name: string;
}

