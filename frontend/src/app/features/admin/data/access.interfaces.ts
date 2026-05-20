export interface Permission {
  _id: string;
  key: string;
  name: string;
  module: string;
  description: string;
  isActive: boolean;
}

export interface Role {
  _id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
