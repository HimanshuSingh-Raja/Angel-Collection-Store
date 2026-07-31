'use client';

import React from 'react';
import { Sparkles, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-black text-amber-100 text-xs py-2 px-4 border-b border-neutral-800 tracking-widest font-sans uppercase overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-6 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-amber-400" /> Complimentary Express Worldwide Delivery</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 100% Certified Authentic Luxury</span>
        </div>

        <div className="flex-1 text-center font-medium text-amber-200 text-[11px] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>USE CODE <strong className="text-white bg-neutral-800 px-2 py-0.5 rounded tracking-wider border border-amber-500/30">ANGEL10</strong> FOR 10% OFF YOUR LUXURY ORDER</span>
        </div>

        <div className="hidden lg:flex items-center space-x-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition"><RefreshCw className="w-3.5 h-3.5 text-amber-400" /> 30-Day Easy Returns</span>
          <span className="text-amber-400 font-semibold">INR (₹)</span>
        </div>
      </div>
    </div>
  );
};
