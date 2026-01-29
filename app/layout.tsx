import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/common/Navigation';
import { QueryProvider } from '@/lib/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Debussy Dashboard',
  description: 'Real-time dashboard for visualizing and monitoring the Debussy multi-agent orchestration system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navigation />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
