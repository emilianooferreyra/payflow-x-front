import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/2fa"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const hasAccessToken = request.cookies.has("access_token")
  const hasRefreshToken = request.cookies.has("refresh_token")
  const isAuthenticated = hasAccessToken || hasRefreshToken

  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Don't redirect to dashboard if the user was explicitly sent to login (session expired)
  const isSessionExpired = request.nextUrl.searchParams.has("expired")
  if (isPublic && isAuthenticated && !isSessionExpired) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
}
