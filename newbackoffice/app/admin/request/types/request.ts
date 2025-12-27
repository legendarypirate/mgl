export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role_id: number;
  bank?: string;
  contact_info?: string;
  account_number?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  email?: string;
  phone?: string;
  bank?: string;
  account_number?: string;
  contact_info?: string;
  address?: string;
  role_id: number;
  password: string;
}

export interface UpdatePhonePayload {
  phone: string;
}

