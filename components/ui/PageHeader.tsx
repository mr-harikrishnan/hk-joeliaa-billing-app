'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, LogOut, User, X, ShieldCheck } from 'lucide-react';
import RefreshButton from './RefreshButton';
import BottomSheet from './BottomSheet';
import { authService } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  refreshAction?: () => Promise<void>;
  rightElement?: React.ReactNode;
}

export default function PageHeader({ title, refreshAction, rightElement }: PageHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    authService.clearSession();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Top Branding Bar (Minimalist) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 flex items-center justify-center">
             <Image
              src="/image.png"
              alt="Logo"
              fill
              priority
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-base font-black text-slate-800 tracking-tight">
            {process.env.NEXT_PUBLIC_BUSINESS_NAME || "Joeliaa"}
          </span>
        </div>
        
        {/* Removed pulse indicators/stickers */}
        <div className="flex items-center space-x-2 md:hidden">
           <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-white border border-slate-100 rounded-xl text-slate-500 active:scale-95 transition-all shadow-sm"
           >
            <Menu size={20} strokeWidth={2.5} />
           </button>
        </div>
      </div>

      {/* Main Section Title & Refresh Control */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        
        <div className="flex items-center space-x-2">
          {refreshAction && (
            <RefreshButton onRefresh={refreshAction} iconOnly={true} />
          )}
          {rightElement}
        </div>
      </div>

      <BottomSheet 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        title="Admin Controls"
      >
        <div className="p-2 space-y-6">
          <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-100">
              JS
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">Joeliaa Store</p>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <ShieldCheck size={12} className="text-teal-600" />
                <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest opacity-80">Authorized Admin</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-5 bg-rose-50 text-rose-600 rounded-[28px] border border-rose-100 font-black text-sm active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                  <LogOut size={18} strokeWidth={2.5} />
                </div>
                <span>Logout System</span>
              </div>
              <X size={14} className="opacity-30" />
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em]">
              Joeliaa v2.4.0 • Secure Session
            </p>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
