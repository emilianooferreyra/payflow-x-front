import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/2fa"]
// Rutas públicas para todos (con o sin sesión) — no redirigen a /dashboard
const OPEN_PATHS = ["/cedears"]
const PUBLIC_PATHS = [...AUTH_PATHS, ...OPEN_PATHS]

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
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))
  const isSessionExpired = request.nextUrl.searchParams.has("expired")
  if (isAuthPath && isAuthenticated && !isSessionExpired) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
}
