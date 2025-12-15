import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { partnersFindOneByEmail, partnersUpdate, partnersFindOneBySlug } from "@/lib/airtable";

export const dynamic = 'force-dynamic';

// Генерация случайного 6-значного кода (буквы + цифры)
function generateRandomSlug(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function GET() {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let partner = await partnersFindOneByEmail(email);
  if (!partner) return NextResponse.json({ error: "partner_not_found" }, { status: 404 });

  let slug = partner.fields?.current_slug || "";

  // Автогенерация slug при первом входе (если нет)
  if (!slug) {
    slug = generateRandomSlug(6);

    // Проверяем уникальность
    let attempts = 0;
    while (attempts < 10) {
      const taken = await partnersFindOneBySlug(slug);
      if (!taken) break;
      slug = generateRandomSlug(6);
      attempts++;
    }

    // Сохраняем slug
    await partnersUpdate(partner.id, { current_slug: slug });
  }

  // Читаем агрегированные данные напрямую из Partners таблицы
  const totalLeads = partner.fields?.['Total Leads'] || 0;
  const totalPending = partner.fields?.['Total pending'] || 0;
  const approved = partner.fields?.['Leads + Apps Count'] || 0; // Approved count
  const confirmedEarnings = partner.fields?.['Total Earned'] || 0; // Confirmed Earnings

  return NextResponse.json({
    total: totalLeads,
    slug,
    approved,
    pending: totalPending,
    confirmedEarnings
  });
}
