
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userId = headersList.get('X-Replit-User-Id');
  const userName = headersList.get('X-Replit-User-Name');

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userName={userName || 'Partner'} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
