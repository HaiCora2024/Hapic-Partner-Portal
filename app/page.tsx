
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const headersList = await headers();
  const userId = headersList.get('X-Replit-User-Id');
  const userAgent = headersList.get('user-agent') || '';

  // If no Replit headers, this is likely a health check
  // Return a simple page instead of redirecting
  if (!userId && !headersList.get('X-Replit-User-Name')) {
    return (
      <html>
        <body>
          <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Hapic Partner Portal</h1>
            <p>Status: OK</p>
          </div>
        </body>
      </html>
    );
  }

  if (userId) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
