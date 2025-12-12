import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { partnersFindOneByEmail, partnersUpdate, partnersFindOneBySlug, appsListByPartner, leadsListByPartner } from "@/lib/airtable";

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

  const pid = partner.fields?.partner_id || "";

  // Получаем данные из обеих таблиц
  const [applications, leadsData] = await Promise.all([
    appsListByPartner(slug, pid),
    leadsListByPartner(slug, pid)
  ]);

  // Объединяем все записи
  const allRecords = [...applications, ...leadsData];

  const byStatus: Record<string, number> = {};
  for (const r of allRecords) {
    const s = (r.fields?.status || "new").toString();
    byStatus[s] = (byStatus[s] || 0) + 1;
  }

  // Calculate earnings based on status
  const approved = byStatus.approved || 0;
  const confirmedEarnings = approved * 200; // €200 per approved lead

  return NextResponse.json({
    total: allRecords.length,
    byStatus,
    slug,
    approved,
    pending: (byStatus.new || 0) + (byStatus.pending || 0),
    confirmedEarnings
  });
}
