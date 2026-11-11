export const routes = {
  home: "/",
  login: "/login",
  setup: "/setup",
  dash: "/dash",
  federated: "/dash/federated",
  followers: "/followers",
  following: "/following",
  followRequests: "/followrequests",
  settings: "/settings",
  settingsDelete: "/settings/delete",
  post: (id: string) => `/posts/${id}`,
} as const;

export const authRoutes = [routes.login, routes.setup] as const;

export const protectedRoutes = [routes.dash, routes.settings] as const;

export function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}
