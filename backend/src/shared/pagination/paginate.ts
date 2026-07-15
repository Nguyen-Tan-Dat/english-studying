export function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), meta: { page, page_size: pageSize, total_items: totalItems, total_pages: totalPages } };
}
