import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow health checks without processing
  if (pathname === '/healthz' || pathname === '/api/health') {
    return NextResponse.next();
  }

  // Check for authentication: Replit headers OR session cookie
  const userId = request.headers.get('X-Replit-User-Id');
  const sessionEmail = request.cookies.get('session_email')?.value;

  const isAuthenticated = !!(userId || sessionEmail);

  // If no auth and trying to access protected routes, redirect to login
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/((?!healthz|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};
