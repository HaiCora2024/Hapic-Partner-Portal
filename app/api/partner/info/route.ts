import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { partnersFindOneByEmail } from "@/lib/airtable";
import QRCode from "qrcode";

export const dynamic = 'force-dynamic';

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const partner = await partnersFindOneByEmail(email);
  if (!partner) {
    return NextResponse.json({ 
      hasSlug: false,
      email 
    });
  }

  const slug = partner.fields?.current_slug;
  
  if (!slug) {
    return NextResponse.json({ 
      hasSlug: false,
      email,
      partnerId: partner.id
    });
  }

  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://your-landing-page.com";
  const referralLink = `${landingUrl}?session=${slug}`;

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
    hasSlug: true,
    email,
    partnerId: partner.id,
    slug,
    referralLink,
    qrCodeDataUrl,
    name: partner.fields?.name || '',
    company: partner.fields?.company || ''
  });
}
