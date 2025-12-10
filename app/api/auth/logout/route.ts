
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
