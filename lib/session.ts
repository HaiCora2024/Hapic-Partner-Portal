// lib/session.ts
import { cookies, headers } from 'next/headers';

export const SESSION_COOKIE = "session_email";

export function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.split("=");
    if (!k) continue;
    out[k.trim()] = decodeURIComponent(rest.join("=").trim() || "");
  }
  return out;
}

export function getSessionEmailFromHeader(cookieHeader: string | null): string | null {
  const c = parseCookies(cookieHeader);
  return c[SESSION_COOKIE] || null;
}

export async function getSessionEmail(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // Client-side
    const cookieString = document.cookie;
    return getSessionEmailFromHeader(cookieString);
  }
  
  // Server-side - use Next.js cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    return sessionCookie?.value || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export function setSession(email: string): Response {
  const response = new Response();
  response.headers.set('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
  return response;
}

export function clearSession(): Response {
  const response = new Response();
  response.headers.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  return response;
}
