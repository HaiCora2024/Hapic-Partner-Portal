
// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { partnersFindOneByEmail, partnersUpdate } from "@/lib/airtable";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, access_code } = await req.json();
    if (!email || !access_code) {
      return NextResponse.json({ error: "bad_input" }, { status: 400 });
    }

    const rec = await partnersFindOneByEmail(email);
    const code = rec?.fields?.access_code || "";
    if (!rec || !code || String(code) !== String(access_code)) {
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    // очистить код (одноразовый)
    await partnersUpdate(rec.id, { access_code: "" });

    // поставить сессию
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: encodeURIComponent(email),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: String(e) }, { status: 500 });
  }
}
