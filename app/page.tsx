'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect to login
    router.push('/login');
  }, [router]);

  // Return simple HTML immediately for health checks
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Hapic Partner Portal</h1>
          <p>Loading...</p>
        </div>
      </body>
    </html>
  );
}
