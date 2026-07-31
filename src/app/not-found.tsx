'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
        <Sparkles className="w-10 h-10" />
      </div>
      <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">ERROR 404</span>
      <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">Luxury Page Not Found</h1>
      <p className="text-xs text-neutral-400 max-w-md font-light">
        The haute couture collection or requested URL does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-4 bg-amber-400 text-neutral-950 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition shadow-xl inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return To Flagship Store</span>
      </Link>
    </div>
  );
}
