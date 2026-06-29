export const feedQueryKeys = {
  all: ["feed"] as const,
  lists: () => [...feedQueryKeys.all, "list"] as const,
  list: (page: number) => [...feedQueryKeys.lists(), page] as const,
  details: () => [...feedQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...feedQueryKeys.details(), id] as const,
};
