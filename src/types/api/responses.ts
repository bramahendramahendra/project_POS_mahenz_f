import { Role, Shop, Menu, User } from '../models';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

// Specific responses
export type RolesResponse = PaginatedResponse<Role>;
export type ShopsResponse = PaginatedResponse<Shop>;
export type MenusResponse = PaginatedResponse<Menu>;
export type UsersResponse = PaginatedResponse<User>;