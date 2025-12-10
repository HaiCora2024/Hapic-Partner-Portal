
import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import {
  partnersFindOneByEmail,
  partnersCreate,
  partnersUpdate,
  partnersFindOneBySlug,
} from "@/lib/airtable";
import QRCode from "qrcode";

export const dynamic = 'force-dynamic';

function sanitizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseFromEmail(email: string) {
  const local = (email || "").split("@")[0] || "";
  return sanitizeSlug(local) || "partner";
}

function rnd(n = 3) {
  const abc = "23456789abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Поля из анкеты (все опционально, но email для slug обязателен)
  const body = await req.json().catch(() => ({}));
  const name = body?.name as string | undefined;
  const company = body?.company as string | undefined;
  const focus = body?.focus as string | undefined;
  const businessEmail = (body?.businessEmail as string | undefined) || email;
  const messenger = body?.messenger as string | undefined;

  // Кандидат на slug — часть до @ из businessEmail
  let slug = baseFromEmail(businessEmail);

  // Проверим уникальность slug (если занят — добавим хвост)
  const taken = await partnersFindOneBySlug(slug);
  if (taken && taken.fields?.email !== email) {
    slug = `${slug}-${rnd()}`;
  }

  // Найдём или создадим партнёра по email из сессии
  let rec = await partnersFindOneByEmail(email);
  const fieldsToSave: Record<string, any> = {
    current_slug: slug,
  };
  if (name) fieldsToSave.name = name;
  if (company) fieldsToSave.company = company;
  if (focus) fieldsToSave.focus = focus;
  if (businessEmail) fieldsToSave.business_email = businessEmail;
  if (messenger) fieldsToSave.messenger = messenger;

  if (rec) {
    await partnersUpdate(rec.id, fieldsToSave);
  } else {
    rec = await partnersCreate({ email, ...fieldsToSave });
  }

  // Создаём полную реферальную ссылку
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://your-landing-page.com";
  const referralLink = `${landingUrl}?ref=${slug}`;

  // Генерируем QR код
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(referralLink, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }

  return NextResponse.json({ 
    slug,
    current_slug: slug,
    referral_link: referralLink,
    qr_code_data_url: qrCodeDataUrl,
    success: true
  });
}
