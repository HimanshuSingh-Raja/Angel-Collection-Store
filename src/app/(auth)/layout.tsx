import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090B0E] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition">
            ANGEL <span className="text-amber-400 font-light">COLLECTION</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition flex items-center gap-1.5"
        >
          <span>Storefront</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] font-mono text-neutral-600 border-t border-neutral-900 relative z-10">
        ANGEL COLLECTION PRIVÉ • SECURE SSL ENCRYPTION 256-BIT • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
