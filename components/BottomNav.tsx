'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, UtensilsCrossed, ReceiptText, ClipboardList } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  const { status } = useSession();
  const isCustomerMode = searchParams.get('mode') === 'customer';
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';

  if (isCustomerMode || isAuthPage || status !== 'authenticated') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-teal-600" : "text-slate-400"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
