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

  // Hide sidebar if in customer mode, on auth pages, OR if user is not logged in
  if (isAuthPage || isCustomerMode || status !== 'authenticated') return null;

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
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-100 translate-x-1" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(!isActive && "group-hover:text-teal-500")} />
              <span>{item.name}</span>
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
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}
