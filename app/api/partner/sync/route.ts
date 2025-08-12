
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    const headersList = await headers();
    const userId = headersList.get('X-Replit-User-Id');
    const userName = headersList.get('X-Replit-User-Name');
    const userEmail = headersList.get('X-Replit-User-Email') || `${userId}@replit.com`;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching partner:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!existingPartner) {
      // Create new partner
      const { data: newPartner, error: insertError } = await supabase
        .from('partners')
        .insert({
          clerk_user_id: userId,
          email: userEmail,
          name: userName
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating partner:', insertError);
        return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
      }

      return NextResponse.json({ partner: newPartner, created: true });
    }

    return NextResponse.json({ partner: existingPartner, created: false });
  } catch (error) {
    console.error('Partner sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
