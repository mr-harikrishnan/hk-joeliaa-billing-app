'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ReceiptText, 
  ClipboardList,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Menu Library', href: '/menu', icon: UtensilsCrossed },
  { name: 'Create Bill', href: '/billing', icon: ReceiptText },
  { name: 'Order History', href: '/orders', icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';
  const isCustomerMode = searchParams.get('mode') === 'customer';

  // Hide sidebar if in customer mode OR if we are on an auth page without a persistent token
  // If we have a local token, we show the sidebar even if session is loading/expired (to avoid flickering)
  const [hasToken, setHasToken] = useState(false);
  
  useEffect(() => {
    setHasToken(!!localStorage.getItem('joeliaa_admin_token'));
  }, []);

  if (isCustomerMode || (isAuthPage && !hasToken)) return null;
  if (status !== 'authenticated' && !hasToken) return null;

  const handleSignOut = async () => {
    localStorage.removeItem('joeliaa_admin_token');
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-100 p-6 shadow-sm overflow-hidden z-20">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl mb-4 bg-slate-50 p-0.5 border border-slate-100">
            <Image src="/JOELIAA.png" alt="JOELIAA" width={80} height={80} className="object-cover rounded-[22px]" />
          </div>
          <h1 className="text-2xl font-black text-teal-600 tracking-tighter leading-none">
            {process.env.NEXT_PUBLIC_BUSINESS_NAME || "JOELIAA"}
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Billing System</p>
        </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group",
                isActive 
                  ? "bg-teal-600 text-white shadow-[0_10px_20px_-5px_rgba(13,148,136,0.3)] translate-x-1" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors duration-300",
                isActive ? "bg-white/10" : "bg-transparent group-hover:bg-teal-50"
              )}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(!isActive && "group-hover:text-teal-600")} />
              </div>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account & Logout */}
      <div className="mt-auto pt-6 border-t border-slate-50 space-y-4">
        <div className="bg-slate-50 p-4 rounded-3xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold shrink-0">
            JS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">Joeliaa Store</p>
            <p className="text-[9px] text-teal-600 font-black uppercase tracking-widest opacity-60">Admin</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}
