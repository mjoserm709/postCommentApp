import { ApiResponse } from '../../../core/models/api-response';
import { PaginatedResult } from '../../../core/models/pagination';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export type CategoriesApiResponse<T> = ApiResponse<T>;
export type PaginatedCategories = PaginatedResult<Category>;
