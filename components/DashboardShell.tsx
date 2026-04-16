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

  // If user is definitely unauthenticated AND has NO local token, 
  // they should only see the children (Login/Public pages) in a clean main wrapper
  if (status === 'unauthenticated' && !hasLocalToken) {
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  const isExpired = status === 'unauthenticated' && hasLocalToken;

  // Final Dashboard UI for Authenticated Admins OR users with local token (showing expiry alert)
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      {/* Sidebar for Desktop */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12 h-full">
          {isExpired ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-10 space-y-10">
               <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-[48px] blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-32 h-32 bg-white rounded-[48px] shadow-2xl flex items-center justify-center border border-red-50">
                    <Image src="/JOELIAA.png" alt="JOELIAA" width={80} height={80} className="object-cover grayscale opacity-50" />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                       <Image src="/JOELIAA.png" alt="JOELIAA" width={16} height={16} className="invert" />
                    </div>
                  </div>
               </div>
               
               <div className="space-y-3 max-w-sm">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">Session Suspended</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                   Your administrative identity needs to be re-verified. Please re-enter your credentials to access the billing dashboard.
                 </p>
               </div>

               <div className="w-full max-w-xs space-y-4">
                 <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-2xl hover:bg-slate-800 hover:translate-y-[-2px] active:scale-95 transition-all text-lg"
                 >
                  Verify Identity Now
                 </button>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Access Only</p>
               </div>
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Bottom Nav for Mobile */}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </main>
    </div>
  );
}
