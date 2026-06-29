export const timelineQueryKeys = {
  all: ["timeline"] as const,
  lists: () => [...timelineQueryKeys.all, "list"] as const,
  list: (page: number) => [...timelineQueryKeys.lists(), page] as const,
  details: () => [...timelineQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...timelineQueryKeys.details(), id] as const,
};
