'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [hasLocalToken, setHasLocalToken] = useState<boolean | null>(null);
  
  // Robust detection for customer view/bill view
  const isBillView = pathname.startsWith('/bills/');
  const isCustomerMode = searchParams.get('mode')?.includes('customer');
  const isPublicView = isBillView && (isCustomerMode || status === 'unauthenticated');
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';

  // Check for the physical token in this browser instance
  useEffect(() => {
    const token = localStorage.getItem('joeliaa_admin_token');
    setHasLocalToken(!!token);
  }, []);

  // Handle Side-Effects (Auto-Redirect for returning users)
  useEffect(() => {
    // If we have a local token but we're on the login page, go to dashboard
    if (hasLocalToken && pathname === '/login') {
      router.push('/');
    }
    
    // If we are definitely NOT authenticated AND have NO local token, go to login
    // but only if we ARE NOT already on a public/auth page
    if (hasLocalToken === false && status === 'unauthenticated' && !isPublicView && !isAuthPage) {
       router.push('/login');
    }
  }, [hasLocalToken, status, pathname, router, isPublicView, isAuthPage]);

  // If its a public customer view, render without shell elements
  if (isPublicView) {
    return (
      <main className="min-h-[100dvh] w-full bg-white relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          {children}
        </div>
      </main>
    );
  }

  // If user is on an auth page, just show the page (login/unauthorized)
  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  // Loading state while either token or session is being verified
  // We only show loading if we DON'T have a token and we are STILL loading the session
  if (hasLocalToken === null || (status === 'loading' && !hasLocalToken)) {
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

  // FINAL SAFETY: If we are unauthenticated and have no token, DO NOT show the dashboard UI
  // This state should eventually be handled by the redirect effect above, but we prevent 
  // the UI from rendering in the meantime.
  if (status === 'unauthenticated' && !hasLocalToken) {
    return <main className="min-h-screen w-full bg-white" />;
  }

  // Final Dashboard UI for Authenticated Admins OR users with local token
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
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
