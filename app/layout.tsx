import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Providers } from '@/components/Providers';
import { auth } from '@/auth';
import DashboardShell from '@/components/DashboardShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JOELIAA Billing | Premium Homemade Treats',
  description: 'Manage your homemade snacks business with ease.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-[#f8fafc] antialiased overflow-x-hidden min-h-screen h-full`}>
        <Providers>
          {isLoggedIn ? (
            <Suspense fallback={null}>
              <DashboardShell>
                {children}
              </DashboardShell>
            </Suspense>
          ) : (
            <main className="min-h-[100dvh] w-full bg-white relative z-50">
              {children}
            </main>
          )}
        </Providers>
      </body>
    </html>
  );
}
