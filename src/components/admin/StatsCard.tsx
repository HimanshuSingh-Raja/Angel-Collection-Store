'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  subtext?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  subtext = 'vs. previous month',
}) => {
  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-admin-muted">{title}</span>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold font-serif tracking-tight text-white">{value}</h3>
      </div>

      <div className="mt-3 flex items-center space-x-2 text-xs">
        <span
          className={`flex items-center font-bold px-2 py-0.5 rounded-md ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
          {change}
        </span>
        <span className="text-[11px] text-admin-muted">{subtext}</span>
      </div>
    </div>
  );
};
