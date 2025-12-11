import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'session_email';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow health checks and root access without auth
  if (pathname === '/' || pathname.startsWith('/api/health') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  // Check for Replit user headers
  const userId = request.headers.get('X-Replit-User-Id');
  
  // Check for session cookie (email login)
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  
  const isAuthenticated = userId || sessionCookie;

  // If no user and trying to access protected routes, redirect to login
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user exists and trying to access login, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
