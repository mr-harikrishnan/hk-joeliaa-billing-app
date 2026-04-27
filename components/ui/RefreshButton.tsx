'use client';

import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  iconOnly?: boolean;
  className?: string;
}

export default function RefreshButton({ onRefresh, iconOnly = true, className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        flex items-center justify-center transition-all active:scale-95 disabled:opacity-50
        ${iconOnly 
          ? 'p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50' 
          : 'space-x-2 px-4 py-2.5 rounded-2xl border bg-white border-slate-100 text-slate-500 hover:border-teal-200 hover:text-teal-600 shadow-sm'}
        ${className}
      `}
    >
      <RefreshCcw 
        size={iconOnly ? 18 : 16} 
        className={`${isRefreshing ? 'animate-spin text-teal-600' : ''}`} 
      />
      {!iconOnly && (
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
          {isRefreshing ? 'Refreshing' : 'Reload' }
        </span>
      )}
    </button>
  );
}
