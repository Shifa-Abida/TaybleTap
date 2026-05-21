import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Redirect legacy QR scans from /menu → /customer/menu
 *
 * Old QR codes pointed to /menu?resto=...&table=...
 * New QR codes point to   /customer/menu?resto=...&table=...
 * This middleware silently upgrades old scans so printed QRs still work.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // If a customer scans an old QR code that goes to /menu with a `resto` param,
  // redirect them to the customer-facing menu page.
  if (pathname === "/menu" && searchParams.has("resto")) {
    const url = request.nextUrl.clone();
    url.pathname = "/customer/menu";
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.next();
}

export const config = {
  // Only run this middleware on the /menu path
  matcher: ["/menu"],
};
