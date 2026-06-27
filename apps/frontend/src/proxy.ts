import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/setup"];

const PROTECTED = ["/dash"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });

  const isProtectedRoute = PROTECTED.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dash", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
