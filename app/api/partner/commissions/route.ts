import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { partnersFindOneByEmail, commissionsListByPartner } from "@/lib/airtable";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = await getSessionEmail();
    if (!email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const partner = await partnersFindOneByEmail(email);
    if (!partner) {
      return NextResponse.json({ error: "partner_not_found" }, { status: 404 });
    }

    // Get commissions data from Airtable
    const commissionsData = await commissionsListByPartner(partner.id);

    // Format commissions data
    const commissions = commissionsData.map((commission: any) => ({
      id: commission.id,
      leadCompanyName: commission.fields['Lead Company Name'] || 'N/A',
      commissionStatus: commission.fields['Commission Status'] || 'pending',
      paymentAmount: commission.fields['Payment Amount'] || 0,
      dateEarned: commission.fields['Date Earned'] || commission.createdTime,
      datePaid: commission.fields['Date Paid'] || null
    }));

    // Sort by date earned (newest first)
    commissions.sort((a, b) => {
      const dateA = new Date(a.dateEarned).getTime();
      const dateB = new Date(b.dateEarned).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
