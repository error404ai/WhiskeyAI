import { db } from "@/db/db";
import { sql } from "drizzle-orm";

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

export interface WhereCondition {
  condition: string;
  params: unknown[];
}

/**
 * Paginator class for Drizzle ORM with a fluent API similar to Laravel's paginator
 */
export class DrizzlePaginatorService<T = Record<string, unknown>> {
  private tableName: string;
  private searchValue: string | null = null;
  private searchColumns: string[] = [];
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private sortBy: string = "id";
  private sortDirection: "ASC" | "DESC" = "ASC";
  private mapper: MapperFunction<T> | null = null;
  private allowedColumns: string[] = [];
  private whereConditions: WhereCondition[] = [];

  /**
   * Create a new paginator instance
   *
   * @param table - The Drizzle table schema or table name string
   */
  constructor(table: string | { _: { name: string } }) {
    this.tableName = typeof table === "string" ? table : table._.name;
  }

  /**
   * Set the search query and columns
   */
  search(value: string, columns: string[] = []): this {
    this.searchValue = value;
    if (columns.length > 0) {
      this.searchColumns = columns;
    }
    return this;
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
   * Set allowed columns for search and sort
   */
  allowColumns(columns: string[]): this {
    this.allowedColumns = columns;
    return this;
  }

  /**
   * Add a custom where condition to the query using parameterized query for safety
   * @example
   * // To filter by user ID safely:
   * paginator.where('user_id = $1', [userId]);
   * 
   * // To filter by name with LIKE:
   * paginator.where('name LIKE $1', [`%${name}%`]);
   */
  where(condition: string, params: unknown[] = []): this {
    this.whereConditions.push({ condition, params });
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

    // Build search filter conditions and parameters
    let whereClause = "";
    const queryParams: unknown[] = [];
    let paramIndex = 1; // For $1, $2, etc.
    
    // Add search filter
    if (this.searchValue && this.searchColumns.length > 0) {
      const searchValue = `%${this.searchValue.toLowerCase()}%`;

      // Filter to only allowed columns if specified
      const usableColumns = this.allowedColumns.length > 0 
        ? this.searchColumns.filter((col) => this.allowedColumns.includes(col)) 
        : this.searchColumns;

      if (usableColumns.length > 0) {
        const searchConditions = usableColumns.map(col => {
          queryParams.push(searchValue);
          return `${col} ILIKE $${paramIndex++}`;
        });
        
        whereClause = `WHERE (${searchConditions.join(" OR ")})`;
      }
    }
    
    // Add custom where conditions
    if (this.whereConditions.length > 0) {
      this.whereConditions.forEach(({ condition, params }) => {
        // Replace $1, $2, etc. with higher indexes to avoid conflicts
        const adjustedCondition = condition.replace(/\$(\d+)/g, (_, num) => {
          const adjustedNum = Number(num) + paramIndex - 1;
          return `$${adjustedNum}`;
        });
        
        const wherePrefix = whereClause ? " AND " : "WHERE ";
        whereClause += `${wherePrefix}(${adjustedCondition})`;
        
        // Add params to the query params array
        queryParams.push(...params);
        paramIndex += params.length;
      });
    }

    // Build parameterized count query
    let countQuery = sql`
      SELECT COUNT(*) as count
      FROM ${sql.raw(this.tableName)}
    `;
    
    // Add where clause if it exists
    if (whereClause) {
      countQuery = sql`${countQuery} ${sql.raw(whereClause)}`;
    }
    
    // Add params to the query
    for (const param of queryParams) {
      countQuery = sql`${countQuery} ${param}`;
    }

    // Build parameterized data query
    let dataQuery = sql`
      SELECT *
      FROM ${sql.raw(this.tableName)}
    `;
    
    // Add where clause if it exists
    if (whereClause) {
      dataQuery = sql`${dataQuery} ${sql.raw(whereClause)}`;
    }
    
    // Add params to the query
    for (const param of queryParams) {
      dataQuery = sql`${dataQuery} ${param}`;
    }
    
    // Add order by and limit
    dataQuery = sql`
      ${dataQuery}
      ORDER BY ${sql.raw(this.sortBy)} ${sql.raw(this.sortDirection)}
      LIMIT ${this.itemsPerPage} OFFSET ${offset}
    `;

    // Execute queries
    const [countResult, dataResult] = await Promise.all([db.execute(countQuery), db.execute(dataQuery)]);

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
