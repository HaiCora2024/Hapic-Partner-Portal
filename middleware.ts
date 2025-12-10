
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Replit user headers
  const userId = request.headers.get('X-Replit-User-Id');

  // If no user and trying to access protected routes, redirect to login
  if (!userId && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user exists and trying to access login, redirect to dashboard
  if (userId && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only match dashboard and login routes, exclude everything else
  matcher: ['/dashboard/:path*', '/login'],
};
