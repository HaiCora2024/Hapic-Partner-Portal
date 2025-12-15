
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('X-Replit-User-Id');
    const userName = headersList.get('X-Replit-User-Name');
    const userEmail = headersList.get('X-Replit-User-Email') || `${userId}@replit.com`;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: userId,
      name: userName,
      email: userEmail
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
