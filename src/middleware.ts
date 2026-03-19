// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = [
  "/profile",
  "/profile/edit",
  "/products/new",
  "/admin",
];

// Routes only for unauthenticated users
const authRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip locale prefix to check route patterns
  const pathnameWithoutLocale = pathname.replace(
    /^\/(en|uz|ru)/,
    ""
  ) || "/";

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");

  if (isProtectedRoute || isAuthRoute) {
    const session = await auth();

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !session) {
      const locale = pathname.split("/")[1] || "en";
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && session) {
      const locale = pathname.split("/")[1] || "en";
      return NextResponse.redirect(new URL(`/${locale}/profile`, req.url));
    }

    // Admin-only routes
    if (isAdminRoute && session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN") {
        const locale = pathname.split("/")[1] || "en";
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all localized routes
    "/(en|uz|ru)/:path*",
    // Redirect root to default locale
    "/",
    // Exclude static files and api routes from intl middleware
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
