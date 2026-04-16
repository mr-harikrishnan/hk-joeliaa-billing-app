'use client';

import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  const handleReturn = () => {
    // Priority 1: Check if the previous page was actually a bill
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    if (referrer && referrer.includes('/bills/')) {
       window.location.href = referrer;
       return;
    }

    // Priority 2: Use router history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-slate-100">
      <div className="w-full max-w-md text-center space-y-12">
        {/* Lock Illustration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex justify-center"
        >
          <div className="relative">
            <div className="w-40 h-44 bg-red-500 rounded-[40px] relative flex items-center justify-center shadow-2xl shadow-red-200">
              <div className="absolute top-[-50px] w-28 h-32 border-[14px] border-slate-300 rounded-t-full -z-10" />
              <div className="w-4 h-10 bg-slate-900 rounded-full relative">
                <div className="absolute top-0 w-8 h-8 bg-slate-900 rounded-full left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Access Locked</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
            The page you are looking for is restricted or does not exist.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <button 
            onClick={handleReturn}
            className="inline-flex items-center space-x-3 px-10 py-5 bg-slate-900 text-white rounded-[32px] font-black shadow-2xl hover:bg-slate-800 hover:translate-y-[-2px] active:scale-95 transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Return to Safety</span>
          </button>
        </motion.div>

        {/* Footer Branding */}
        <div className="pt-12">
           <div className="flex items-center justify-center space-x-2 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
              <ShieldAlert size={14} />
              <span>Security Node {process.env.NEXT_PUBLIC_BUSINESS_NAME || "JOELIAA"}-v2</span>
           </div>
        </div>
      </div>
    </div>
  );
}
