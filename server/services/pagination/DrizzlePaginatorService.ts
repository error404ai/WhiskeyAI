import { db } from "@/db/db";
import { SQLWrapper, sql } from "drizzle-orm";

export interface PaginationResult<T> {
  data: T[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
}

export type MapperFunction<T> = (item: Record<string, unknown>) => T;

/**
 * Paginator class for Drizzle ORM with a fluent API similar to Laravel's paginator
 * Works exclusively with Drizzle query builder objects
 */
export class DrizzlePaginatorService<T = Record<string, unknown>> {
  private baseQuery: SQLWrapper;
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private sortBy: string = "id";
  private sortDirection: "ASC" | "DESC" = "ASC";
  private mapper: MapperFunction<T> | null = null;
  private allowedColumns: string[] = [];
  private countColumn: string = "*";

  /**
   * Create a new paginator instance with a Drizzle query builder
   * 
   * @param query - The Drizzle query builder object
   * @param countColumn - Column to use for count (defaults to "*")
   */
  constructor(query: SQLWrapper, countColumn: string = "*") {
    this.baseQuery = query;
    this.countColumn = countColumn;
  }

  /**
   * Set the page number
   */
  page(page: number): this {
    this.currentPage = Math.max(1, page);
    return this;
  }

  /**
   * Set the number of items per page
   */
  perPage(count: number): this {
    this.itemsPerPage = Math.max(1, count);
    return this;
  }

  /**
   * Set the sort column and direction
   */
  orderBy(column: string, direction: "asc" | "desc" = "asc"): this {
    // Check if column is allowed or use default
    this.sortBy = this.allowedColumns.length === 0 || this.allowedColumns.includes(column) ? column : "id";
    this.sortDirection = direction.toUpperCase() as "ASC" | "DESC";
    return this;
  }

  /**
   * Set allowed columns for sort
   */
  allowColumns(columns: string[]): this {
    this.allowedColumns = columns;
    return this;
  }

  /**
   * Set a function to map the results
   */
  map<R>(mapperFn: (item: Record<string, unknown>) => R): DrizzlePaginatorService<R> {
    this.mapper = mapperFn as unknown as MapperFunction<T>;
    return this as unknown as DrizzlePaginatorService<R>;
  }

  /**
   * Execute the query and return paginated results
   */
  async paginate(perPage?: number): Promise<PaginationResult<T>> {
    // Update per page if provided
    if (perPage !== undefined) {
      this.itemsPerPage = Math.max(1, perPage);
    }

    // Calculate offset
    const offset = (this.currentPage - 1) * this.itemsPerPage;

    // Use the provided query builder as a subquery
    const countQuery = sql`SELECT COUNT(${sql.raw(this.countColumn)}) as count FROM (${this.baseQuery}) as subquery`;
    
    const dataQuery = sql`
      SELECT * FROM (${this.baseQuery}) as subquery
      ORDER BY ${sql.raw(this.sortBy)} ${sql.raw(this.sortDirection)}
      LIMIT ${this.itemsPerPage} OFFSET ${offset}
    `;

    // Execute queries
    const [countResult, dataResult] = await Promise.all([
      db.execute(countQuery),
      db.execute(dataQuery)
    ]);

    // Get total count
    const totalItems = Number(countResult.rows[0]?.count || 0);

    // Map results if mapper provided
    const data = this.mapper ? dataResult.rows.map(this.mapper) : (dataResult.rows as T[]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data,
      total: totalItems,
      perPage: this.itemsPerPage,
      currentPage: this.currentPage,
      lastPage: totalPages,
      from: offset + 1,
      to: offset + data.length,
    };
  }
}
