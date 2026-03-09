import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith("/api")) {
    return handleAuth(request, pathname);
  }

  // Run i18n middleware first
  const response = intlMiddleware(request);

  // Extract the locale-stripped pathname for auth checks
  const localeMatch = pathname.match(/^\/(fr|en|ar)(\/.*)?$/);
  const strippedPath = localeMatch ? localeMatch[2] || "/" : pathname;

  // Run auth checks on the stripped path
  const authResponse = await handleAuth(request, strippedPath);
  if (authResponse && authResponse.status !== 200) {
    return authResponse;
  }

  return response;
}

async function handleAuth(request: NextRequest, pathname: string) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!token.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect supplier routes
  if (pathname.startsWith("/supplier")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "supplier") {
      return NextResponse.redirect(new URL("/become-supplier", request.url));
    }
  }

  // Protect supplier API routes
  if (
    pathname.startsWith("/api/supplier") &&
    !pathname.includes("/register")
  ) {
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "supplier") {
      return NextResponse.json(
        { message: "Supplier account required" },
        { status: 403 },
      );
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!token.isAdmin) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }
  }

  return null;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
