import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect to /overview if already authenticated
const PUBLIC_ROUTES = ["/login"];
// Always accessible regardless of auth state
const OPEN_ROUTES = ["/accept-invite"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/overview":        ["SOC_ANALYST", "COMPLIANCE_OFFICER", "SYSTEM_ADMIN"],
  "/threat-feed":     ["SOC_ANALYST", "SYSTEM_ADMIN"],
  "/compliance":      ["COMPLIANCE_OFFICER", "SYSTEM_ADMIN"],
  "/user-management": ["SYSTEM_ADMIN"],
  "/settings":        ["SYSTEM_ADMIN"],
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (OPEN_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = req.cookies.get("ns_token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/overview", req.url));
    }
    return NextResponse.next();
  }

  const token = req.cookies.get("ns_token")?.value;
  const role = req.cookies.get("ns_role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const matchedRoute = Object.keys(ROLE_ROUTES).find((r) => pathname.startsWith(r));
  if (matchedRoute && role) {
    const allowed = ROLE_ROUTES[matchedRoute];
    if (!allowed.includes(role)) {
      return NextResponse.redirect(new URL("/overview", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.json).*)",
  ],
};
