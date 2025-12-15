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

    const partner = await partnersFindOneByEmail(email);
    if (!partner) {
      return NextResponse.json({ leads: [] });
    }

    const slug = partner.fields?.current_slug || "";
    const pid = partner.fields?.partner_id || "";

    const [applications, leadsData] = await Promise.all([
      appsListByPartner(slug, pid),
      leadsListByPartner(slug, pid)
    ]);

    const appsFormatted = applications.map((app: any) => {
      const status = app.fields.status || app.fields.Status || 'new';
      const profit = status === 'approved' ? 200 : 0;
      return {
        id: app.id,
        contact_name: app.fields['Contact Person Name'] || app.fields.name || 'N/A',
        contact_email: app.fields['Email'] || app.fields.business_email || 'N/A',
        company_name: app.fields['Company Name'] || app.fields.company || 'N/A',
        contact_phone: app.fields['Contact Phone/messenger'] || app.fields.phone || '',
        status,
        created_at: app.fields['Submission Date'] || app.fields.created_at || app.createdTime,
        source: 'applications',
        profit
      };
    });

    const leadsFormatted = leadsData.map((lead: any) => {
      const status = lead.fields.status || lead.fields.Status || 'new';
      const profit = status === 'approved' ? 200 : 0;
      return {
        id: lead.id,
        contact_name: lead.fields['Contact Person Name'] || lead.fields.name || 'N/A',
        contact_email: lead.fields['Email'] || lead.fields.business_email || 'N/A',
        company_name: lead.fields['Company Name'] || lead.fields.company || 'N/A',
        contact_phone: lead.fields['Contact Phone/messenger'] || lead.fields.phone || '',
        status,
        created_at: lead.fields['Submission Date'] || lead.fields.created_at || lead.createdTime,
        source: 'leads',
        profit
      };
    });

    const allLeads = [...appsFormatted, ...leadsFormatted];
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

    const partner = await partnersFindOneByEmail(email);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const body = await request.json();

    const API_KEY = process.env.AIRTABLE_API_KEY!;
    const BASE_ID = process.env.AIRTABLE_BASE_ID!;
    const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || "Leads";

    // Подготавливаем данные для Airtable с правильными именами полей
    const fieldsToCreate = {
      'Company Name': body.company_name,
      'Contact Person Name': body.contact_name,
      'Email': body.contact_email,
      'Contact Phone/messenger': body.contact_phone,
      'Monthly Revenue': body.monthly_revenue,
      'Current Banking Provider': body.current_bank,
      'Best Time to Contact': body.best_contact_time,
      'partner_id': [partner.id],  // Linked record (array format)
      'status': 'new'
    };

    console.log('Creating lead with fields:', fieldsToCreate);

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(LEADS_TABLE)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: fieldsToCreate
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable error:', errorText);
      return NextResponse.json({
        error: 'Airtable error',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Lead created successfully:', data.records[0].id);
    return NextResponse.json({
      success: true,
      data: data.records[0]
    });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
