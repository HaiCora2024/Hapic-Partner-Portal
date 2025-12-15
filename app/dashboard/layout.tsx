import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  const userId = headersList.get('X-Replit-User-Id');
  const userName = headersList.get('X-Replit-User-Name');
  const sessionEmail = cookieStore.get('session_email')?.value;

  const isAuthenticated = userId || sessionEmail;

  if (!isAuthenticated) {
    redirect('/login');
  }

  const displayName = userName || (sessionEmail ? decodeURIComponent(sessionEmail) : 'Partner');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userName={displayName} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
