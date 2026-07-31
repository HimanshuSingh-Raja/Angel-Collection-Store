'use client';

import React from 'react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 text-center space-y-6">
      <span className="text-xs uppercase tracking-[0.3em] font-bold text-rose-500">ERROR 500</span>
      <h1 className="font-serif text-4xl font-bold tracking-tight">Something Went Wrong</h1>
      <p className="text-xs text-neutral-400 max-w-md font-light">
        Our technical concierge team has been notified. Please try refreshing the page.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-4 bg-amber-400 text-neutral-950 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition"
      >
        Try Again
      </button>
    </div>
  );
}
