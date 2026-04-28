'use client';

import React from 'react';
import Image from 'next/image';
import RefreshButton from './RefreshButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  refreshAction?: () => Promise<void>;
  rightElement?: React.ReactNode;
}

export default function PageHeader({ title, refreshAction, rightElement }: PageHeaderProps) {
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
        <div className="flex items-center space-x-2">
           {/* Right side is intentionally empty or used for actions only */}
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
    </div>
  );
}
