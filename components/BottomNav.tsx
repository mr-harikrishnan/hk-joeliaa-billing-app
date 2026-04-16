'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ReceiptText, ClipboardList } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authService } from '@/lib/auth-service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tabs = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Billing', href: '/billing', icon: ReceiptText },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCustomerMode = searchParams.get('mode') === 'customer';
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';
  
  const isLoggedIn = authService.isTokenValid();

  if (isCustomerMode || isAuthPage) return null;
  if (!isLoggedIn) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)] md:hidden">
      <div className="flex justify-around items-center h-20 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center relative px-2 min-w-[64px] h-full transition-all duration-300",
                isActive ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-teal-600 rounded-b-full shadow-[0_2px_10px_rgba(13,148,136,0.3)]" />
              )}
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-teal-50/50 scale-110" : "bg-transparent"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight mt-1 transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
