'use client';

import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { SearchModal } from '@/components/search/SearchModal';

export const SearchBar: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative w-full max-w-lg font-sans text-xs">
        {/* 44px Pill Search Bar Trigger */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full h-11 sm:h-12 flex items-center bg-neutral-100/90 hover:bg-white rounded-full border border-neutral-200/80 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all duration-300 px-4 text-left cursor-pointer min-h-[44px]"
        >
          <Search className="w-4 h-4 text-amber-700 shrink-0 mr-3" />
          <span className="flex-1 text-neutral-400 font-medium truncate text-xs sm:text-xs">
            Search luxury sarees, lehengas, suits, bags...
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-neutral-200/60 text-neutral-600 text-[10px] font-mono">
              ⌘K
            </span>
            <div className="p-1 rounded-full text-neutral-400 hover:text-amber-800">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
      </div>

      {/* Full Screen / Mobile Friendly Instant Search Overlay Modal */}
      <SearchModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
