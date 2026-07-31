import React from 'react';

export default function StoreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
      <div className="h-8 bg-neutral-200 rounded-xl w-64 mx-auto" />
      <div className="h-96 bg-neutral-200 rounded-3xl w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-neutral-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
