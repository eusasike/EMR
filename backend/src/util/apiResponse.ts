export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  count: number;
  data: T[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | string[];
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}
