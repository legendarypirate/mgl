// types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  contact_info?: string;
  role_id: number;
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