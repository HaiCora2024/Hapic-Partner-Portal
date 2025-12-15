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

// Генерация случайного 6-значного кода (буквы + цифры)
function generateRandomSlug(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Поля из анкеты (опционально)
  const body = await req.json().catch(() => ({}));
  const name = body?.name as string | undefined;
  const company = body?.company as string | undefined;
  const focus = body?.focus as string | undefined;
  const businessEmail = (body?.businessEmail as string | undefined) || email;
  const messenger = body?.messenger as string | undefined;

  // Генерируем случайный 6-значный slug
  let slug = generateRandomSlug(6);

  // Проверяем уникальность (если занят — генерируем новый)
  let attempts = 0;
  while (attempts < 10) {
    const taken = await partnersFindOneBySlug(slug);
    if (!taken) break; // Slug свободен
    slug = generateRandomSlug(6); // Генерируем новый
    attempts++;
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

  // Создаём полную реферальную ссылку с параметром session
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://onboarding.hapic.com/api/apply/login";
  const referralLink = `${landingUrl}?session=${slug}`;

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
