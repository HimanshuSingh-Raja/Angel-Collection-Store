'use client';

import React from 'react';

export function ProductSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-neutral-200/70 shadow-sm animate-pulse space-y-3">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-neutral-200/70 rounded-xl" />

      {/* Details Skeleton */}
      <div className="space-y-2 px-1">
        <div className="h-2.5 bg-neutral-200/80 rounded w-1/3" />
        <div className="h-3.5 bg-neutral-200/90 rounded w-4/5" />
        <div className="h-3 bg-neutral-200/70 rounded w-2/3" />
        
        {/* Price Skeleton */}
        <div className="pt-1 flex items-center justify-between">
          <div className="h-4 bg-neutral-200/90 rounded w-1/2" />
          <div className="h-3 bg-neutral-200/60 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeletonCard key={i} />
      ))}
    </div>
  );
}
