export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
