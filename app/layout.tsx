import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hapic Partner Portal',
  description: 'Partner portal for Hapic EMI services',
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}