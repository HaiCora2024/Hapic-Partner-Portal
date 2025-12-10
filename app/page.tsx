
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const headersList = await headers();
  const userId = headersList.get('X-Replit-User-Id');
  
  if (userId) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
