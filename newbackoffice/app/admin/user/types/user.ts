// types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  contact_info?: string;
  role_id: number;
  bank?: string;
  account_number?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  email?: string;
  phone?: string;
  contact_info?: string;
  role_id: number;
  password: string;
}