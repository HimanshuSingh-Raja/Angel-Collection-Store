'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, Check } from 'lucide-react';

interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (val: any) => void;
}

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  isOpen,
  onClose,
  sortBy,
  setSortBy,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen]);

  const options = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'popularity', label: 'Popularity & Trending' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-2xl flex flex-col max-h-[70vh] overflow-hidden z-[101] pb-safe"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif font-bold text-base text-neutral-900">Sort Products By</h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white transition flex items-center justify-center text-neutral-700 cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Close sort modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-4 space-y-1.5 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition border text-xs font-semibold cursor-pointer min-h-[48px] ${
                      isSelected
                        ? 'bg-neutral-950 text-amber-300 border-neutral-950 shadow-sm'
                        : 'bg-white text-neutral-800 border-neutral-100 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
