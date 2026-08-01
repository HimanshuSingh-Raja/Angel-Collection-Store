'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState } from '@/types';
import { FilterSidebar } from './FilterSidebar';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeCount: number;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resetFilters,
  activeCount,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans touch-none">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-[101] pb-safe"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="px-6 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Filter Products {activeCount > 0 && `(${activeCount})`}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 min-h-[44px] px-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white transition flex items-center justify-center text-neutral-700 cursor-pointer min-h-[44px] min-w-[44px]"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
              <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
            </div>

            {/* Bottom Action Bar */}
            <div className="p-4 bg-white border-t border-neutral-100 flex items-center gap-3 shrink-0">
              <button
                onClick={resetFilters}
                className="flex-1 h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl transition min-h-[44px] cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-12 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition min-h-[44px] cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
