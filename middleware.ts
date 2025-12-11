import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем данные сессии
  const userId = request.headers.get('X-Replit-User-Id');
  const sessionEmail = request.cookies.get('session_email')?.value;
  const isAuthenticated = !!(userId || sessionEmail);

  // 1. Защита Dashboard
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Если уже авторизован, не пускаем на Login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ВАЖНО: Мы убрали '/' из matcher. 
  // Middleware теперь работает ТОЛЬКО на /dashboard и /login
  // Это уберет ошибку "Middleware adding unnecessary overhead"
  matcher: [
    '/dashboard/:path*', 
    '/login'
  ],
};