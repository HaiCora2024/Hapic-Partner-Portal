import { Metadata } from 'next';

export const metadata: Metadata = {
  other: {
    refresh: '0;url=/login',
  },
};

export default function RootPage() {
  // Simple static server component with meta refresh
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Hapic Partner Portal</h1>
      <p>Redirecting to login...</p>
      <noscript>
        <a href="/login">Click here if not redirected</a>
      </noscript>
    </div>
  );
}
