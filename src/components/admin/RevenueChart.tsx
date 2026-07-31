'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const weeklyData = [
  { day: 'Mon', revenue: 145000, profit: 58000, orders: 12 },
  { day: 'Tue', revenue: 210000, profit: 84000, orders: 18 },
  { day: 'Wed', revenue: 185000, profit: 74000, orders: 15 },
  { day: 'Thu', revenue: 290000, profit: 116000, orders: 24 },
  { day: 'Fri', revenue: 380000, profit: 152000, orders: 32 },
  { day: 'Sat', revenue: 520000, profit: 208000, orders: 45 },
  { day: 'Sun', revenue: 460000, profit: 184000, orders: 38 },
];

const monthlyData = [
  { day: 'Jan', revenue: 1240000, profit: 496000, orders: 120 },
  { day: 'Feb', revenue: 1680000, profit: 672000, orders: 155 },
  { day: 'Mar', revenue: 1450000, profit: 580000, orders: 140 },
  { day: 'Apr', revenue: 2100000, profit: 840000, orders: 195 },
  { day: 'May', revenue: 2850000, profit: 1140000, orders: 260 },
  { day: 'Jun', revenue: 3400000, profit: 1360000, orders: 310 },
  { day: 'Jul', revenue: 4180000, profit: 1672000, orders: 385 },
];

export const RevenueChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const data = timeframe === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-white tracking-tight">Sales & Revenue Analytics</h3>
          <p className="text-xs text-admin-muted">Gross Revenue vs. Net Profit breakdown</p>
        </div>

        <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border text-xs">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeframe === 'weekly' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-admin-muted hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeframe === 'monthly' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-admin-muted hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#202636" vertical={false} />
            <XAxis dataKey="day" stroke="#8A94A6" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#8A94A6"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131720',
                borderColor: '#202636',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Gross Revenue"
              stroke="#D4AF37"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Net Profit"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
