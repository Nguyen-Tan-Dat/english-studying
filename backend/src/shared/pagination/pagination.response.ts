export type PageResponse<T> = { items: T[]; meta: { page: number; page_size: number; total_items: number; total_pages: number } };
