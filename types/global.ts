export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  errors?: string[];
}

export type SortDirection = "asc" | "desc";

export interface DateRange {
  startDate: string;
  endDate: string;
}
