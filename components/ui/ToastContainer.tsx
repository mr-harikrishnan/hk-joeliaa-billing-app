'use client';

import { useToastStore, ToastType } from '@/store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

const icons: Record<ToastType, any> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors: Record<ToastType, string> = {
  success: 'bg-emerald-50/90 text-emerald-700 border-emerald-100',
  error: 'bg-rose-50/90 text-rose-700 border-rose-100',
  info: 'bg-blue-50/90 text-blue-700 border-blue-100',
  warning: 'bg-amber-50/90 text-amber-700 border-amber-100',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 left-6 md:left-auto md:w-96 z-[9999] flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center p-4 rounded-2xl border shadow-xl backdrop-blur-md
                ${colors[toast.type]}
              `}
            >
              <div className={`shrink-0 mr-3 ${iconColors[toast.type]}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <p className="flex-1 text-[13px] font-bold tracking-tight leading-tight">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 p-1.5 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} strokeWidth={2.5} className="opacity-50" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
