export const routes = {
  home: "/",
  login: "/login",
  setup: "/setup",
  dash: "/dash",
} as const;

export const authRoutes = [routes.login, routes.setup] as const;

export const protectedRoutes = [routes.dash] as const;

export function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}
