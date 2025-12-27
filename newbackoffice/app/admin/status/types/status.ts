export interface Status {
  id: number;
  status: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatusPayload {
  status: string;
}

