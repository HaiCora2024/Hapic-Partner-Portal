// app/api/leads/route.ts
    import { NextRequest, NextResponse } from "next/server";
    import { getSessionEmail } from "@/lib/session";
    import { appsListByPartner, leadsListByPartner, partnersFindOneByEmail } from "@/lib/airtable";

    export const dynamic = 'force-dynamic';

    export async function GET() {
      try {
        const email = await getSessionEmail();
        if (!email) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Получаем партнёра
        const partner = await partnersFindOneByEmail(email);
        if (!partner) {
          return NextResponse.json({ leads: [] });
        }

        // Получаем данные из ОБЕИХ таблиц параллельно
        const [applications, leadsData] = await Promise.all([
          appsListByPartner(partner.fields.current_slug, partner.id),
          leadsListByPartner(partner.fields.current_slug, partner.id)
        ]);

        // Преобразуем Applications в нужный формат
        const appsFormatted = applications.map((app: any) => ({
          id: app.id,
          contact_name: app.fields.name || 'N/A',
          contact_email: app.fields.business_email || app.fields.email || 'N/A',
          company_name: app.fields.company || app.fields.company_name || 'N/A',
          status: app.fields.status || 'new',
          created_at: app.fields['Submission Date'] || app.fields.created_at || app.createdTime,
          source: 'applications'
        }));

        // Преобразуем Leads в нужный формат
        const leadsFormatted = leadsData.map((lead: any) => ({
          id: lead.id,
          contact_name: lead.fields.name || 'N/A',
          contact_email: lead.fields.business_email || lead.fields.email || 'N/A',
          company_name: lead.fields.company || lead.fields.company_name || 'N/A',
          status: lead.fields.status || 'new',
          created_at: lead.fields['Submission Date'] || lead.fields.created_at || lead.createdTime,
          source: 'leads'
        }));

        // Объединяем оба источника
        const allLeads = [...appsFormatted, ...leadsFormatted];

        // Сортируем по дате (новые сначала)
        allLeads.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        return NextResponse.json({ leads: allLeads });
      } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    export async function POST(request: NextRequest) {
      try {
        const email = await getSessionEmail();
        if (!email) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Создаём запись в Applications таблице Airtable
        const API_KEY = process.env.AIRTABLE_API_KEY!;
        const BASE_ID = process.env.AIRTABLE_BASE_ID!;
        const APPS = process.env.AIRTABLE_APPLICATIONS_TABLE || "Applications";

        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(APPS)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [{
              fields: {
                partner_email: email,
                company_name: body.company_name,
                contact_name: body.contact_name,
                contact_email: body.contact_email,
                contact_phone: body.contact_phone,
                monthly_revenue: body.monthly_revenue,
                current_bank: body.current_bank,
                best_contact_time: body.best_contact_time,
                status: 'new',
                created_at: new Date().toISOString()
              }
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Airtable error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({ data: data.records[0] });
      } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }