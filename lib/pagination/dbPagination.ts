import { QueryResult } from "pg";

export const withSqlPagination = <T>(queryResult: QueryResult<T[]>, perPage: number, page: number): Pagination<T[]> => {
  const totalItems = queryResult.rowCount ?? 0;
  const offset = (page - 1) * perPage;
  const data = queryResult.rows.slice(offset, offset + perPage) as T[];
  const totalPages = Math.ceil(totalItems / perPage);
  const pagination = {
    total: totalItems,
    perPage,
    currentPage: page,
    lastPage: totalPages,
    from: offset + 1,
    to: offset + data.length,
  };

  return {
    ...pagination,
    data,
  };
};
