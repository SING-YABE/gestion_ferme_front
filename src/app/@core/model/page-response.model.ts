export interface PageResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

export function emptyPage(): PageResponse {
  return {
    content: [], totalElements: 0, totalPages: 0, size: 0, page: 0
  }
}
