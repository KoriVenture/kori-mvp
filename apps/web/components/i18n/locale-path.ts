export function withSearchParams(pathname: string, query: string): string {
  return query ? `${pathname}?${query}` : pathname;
}
