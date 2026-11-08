import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only: real authorization is enforced by the API on every request.
const PROTECTED = ["/onboarding", "/dashboard", "/skills", "/paths", "/practice", "/assessments", "/profile", "/settings", "/trainer", "/enterprise"];

export function proxy(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (PROTECTED.some((x) => p === x || p.startsWith(x + "/")) && !req.cookies.get("trail_session")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", p);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next|favicon.ico).*)"] };
