export interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

export interface PaginationControls {
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}