export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface BaseQueryParams {
  [key: string]: string | number | boolean | undefined;
}