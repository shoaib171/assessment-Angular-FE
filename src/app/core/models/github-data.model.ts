export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  docs: T[];
}

export interface CollectionQueryParams {
  page: number;
  limit: number;
  q?: string;
  sort?: string;
  filter?: string;
}