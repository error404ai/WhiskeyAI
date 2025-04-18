interface PaginatedProps {
  perPage?: number;
  page?: number;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchColumns?: string[];
}
