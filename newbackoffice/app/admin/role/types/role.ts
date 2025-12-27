export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  module: string;
  action: string;
}

export interface UpdateRolePermissionsPayload {
  permissions: number[];
}

