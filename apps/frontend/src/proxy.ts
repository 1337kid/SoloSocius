import { NextRequest, NextResponse } from "next/server";

import {
  authRoutes,
  matchesRoute,
  protectedRoutes,
  routes,
} from "@/lib/routes";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth")?.value;

  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));

  const isProtectedRoute = protectedRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL(routes.login, request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL(routes.dash, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
