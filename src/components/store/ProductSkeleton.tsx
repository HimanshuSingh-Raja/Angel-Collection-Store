'use client';

import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[18px] overflow-hidden border border-neutral-100 shadow-xs animate-pulse flex flex-col h-full">
      {/* 1080:1455 Image Aspect Ratio Placeholder */}
      <div className="relative aspect-[1080/1455] w-full bg-neutral-200" />

      {/* Content Placeholder */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-2.5 bg-neutral-200 rounded w-1/3" />
          <div className="h-3.5 bg-neutral-200 rounded w-full" />
          <div className="h-3.5 bg-neutral-200 rounded w-2/3" />
        </div>

        <div className="space-y-2 pt-1">
          <div className="h-3 bg-neutral-200 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-9 bg-neutral-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
};
