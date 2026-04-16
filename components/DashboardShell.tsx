'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAdminLocally, setIsAdminLocally] = useState<boolean | null>(null);

  // Check for the physical "Admin Key" in this specific browser instance
  useEffect(() => {
    const isActive = localStorage.getItem('joeliaa_admin_active') === 'true';
    setIsAdminLocally(isActive);
  }, []);
  
  // Robust detection for customer view
  const isCustomerMode = searchParams.get('mode')?.includes('customer') || pathname.startsWith('/bills/');

  // If still checking OR it's a customer view, OR the ADMIN KEY is missing on a dashboard route
  if (isCustomerMode || isAdminLocally === false) {
    return (
      <main className="min-h-[100dvh] w-full bg-white relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {children}
        </div>
      </main>
    );
  }

  // Professional Full-Page State Check
  if (isAdminLocally === null) {
     return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center space-y-6">
           <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl animate-pulse">
              <Image src="/JOELIAA.png" alt="JOELIAA" width={64} height={64} className="object-cover" />
           </div>
           <div className="space-y-2">
              <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Verifying Secure Session</p>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for Desktop */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12">
          {children}
        </div>
        
        {/* Bottom Nav for Mobile */}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </main>
    </div>
  );
}
