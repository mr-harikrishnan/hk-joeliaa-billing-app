'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[32px] shadow-2xl max-w-md mx-auto overflow-hidden"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
            
            <div className="px-6 pb-2 sm:pb-4 flex items-center justify-between border-b border-gray-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="px-5 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-12 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
