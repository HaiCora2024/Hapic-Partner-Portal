
// app/api/login/request-code/route.ts
import { NextResponse } from "next/server";
import { partnersFindOneByEmail, partnersCreate, partnersUpdate } from "@/lib/airtable";
import { sendLoginCode } from "@/lib/email";

export const dynamic = 'force-dynamic';

function genCode(n = 6) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return NextResponse.json({ error: "bad_email" }, { status: 400 });
    }

    let rec = await partnersFindOneByEmail(email);
    if (!rec) {
      rec = await partnersCreate({ email, status: "new" });
    } else if (!rec.fields?.status) {
      await partnersUpdate(rec.id, { status: "new" });
    }

    // Если доступна почтовая интеграция — сгенерируем и отправим код сами
    if (process.env.SENDGRID_API_KEY || process.env.SMTP_HOST) {
      const code = genCode(6);
      await partnersUpdate(rec.id, { access_code: code });
      await sendLoginCode(email, code);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: String(e) }, { status: 500 });
  }
}
