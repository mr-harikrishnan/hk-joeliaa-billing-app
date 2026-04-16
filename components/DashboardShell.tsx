'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { Suspense } from 'react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isPublicView = pathname.startsWith('/bill/');
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';

  // If public customer view or auth page, render without shell elements
  if (isPublicView) {
    return (
      <main className="min-h-[100dvh] w-full bg-white relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          {children}
        </div>
      </main>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  // Final Dashboard UI for Authenticated Admins
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      <main className="flex-1 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12 h-full">
          {children}
        </div>
        
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </main>
    </div>
  );
}
