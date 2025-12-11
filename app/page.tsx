import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  // Check if this is a health check request (no accept header or curl/bot)
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const accept = headersList.get('accept') || '';
  
  // Health check bots usually don't send accept: text/html
  const isHealthCheck = !accept.includes('text/html') || 
    userAgent.includes('curl') || 
    userAgent.includes('health') ||
    userAgent.includes('kube') ||
    userAgent.includes('Replit');

  if (isHealthCheck) {
    // Return simple HTML for health checks - immediate 200
    return (
      <html>
        <body>
          <h1>OK</h1>
        </body>
      </html>
    );
  }

  // For browser requests, redirect to login
  redirect('/login');
}
