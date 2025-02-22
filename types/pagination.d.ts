type Pagination<T> = {
  data: T;
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
};

type PaginatedProps = {
  perPage?: number;
  page?: number;
  search?: string;
  searchColumns?: string[];
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
};
