
// lib/airtable.ts
const API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const PARTNERS = process.env.AIRTABLE_PARTNERS_TABLE || "Partners";
const APPS = process.env.AIRTABLE_APPLICATIONS_TABLE || "Applications";

function esc(v: string) {
  // экранирование одинарной кавычки для формулы Airtable
  return (v ?? "").replace(/'/g, "\\'");
}

async function atFetch(path: string, init?: RequestInit) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${path}`;
  const r = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Airtable ${r.status}: ${t}`);
  }
  return r.json();
}

export async function partnersFindOneByEmail(email: string) {
  const ff = encodeURIComponent(`{email}='${esc(email)}'`);
  const data = await atFetch(`${encodeURIComponent(PARTNERS)}?maxRecords=1&filterByFormula=${ff}`);
  return data.records?.[0] || null;
}

export async function partnersCreate(fields: Record<string, any>) {
  const data = await atFetch(encodeURIComponent(PARTNERS), {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] }),
  });
  return data.records?.[0] || null;
}

export async function partnersUpdate(id: string, fields: Record<string, any>) {
  const data = await atFetch(encodeURIComponent(PARTNERS), {
    method: "PATCH",
    body: JSON.stringify({ records: [{ id, fields }] }),
  });
  return data.records?.[0] || null;
}

export async function appsListByPartner(currentSlug?: string, partnerId?: string) {
  const terms: string[] = [];
  if (currentSlug) terms.push(`AND({referrer}!='', {referrer}='${esc(currentSlug)}')`);
  if (partnerId) terms.push(`AND({partner_id}!='', {partner_id}='${esc(partnerId)}')`);
  const or = terms.length ? (terms.length === 1 ? terms[0] : `OR(${terms.join(",")})`) : "FALSE()";
  const ff = encodeURIComponent(or);
  const data = await atFetch(`${encodeURIComponent(APPS)}?filterByFormula=${ff}&pageSize=100`);
  return data.records || [];
}

export async function partnersFindOneBySlug(slug: string) {
  const ff = encodeURIComponent(`{current_slug}='${esc(slug)}'`);
  const data = await atFetch(`${encodeURIComponent(PARTNERS)}?maxRecords=1&filterByFormula=${ff}`);
  return data.records?.[0] || null;
}
