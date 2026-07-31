'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const categoryData = [
  { name: 'Haute Couture', value: 45, color: '#D4AF37' },
  { name: 'Fine Jewellery', value: 30, color: '#F59E0B' },
  { name: 'Bespoke Suits', value: 15, color: '#3B82F6' },
  { name: 'Leather Goods', value: 10, color: '#10B981' },
];

export const SalesByCategoryChart: React.FC = () => {
  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg space-y-4">
      <h3 className="font-serif text-lg font-bold text-white tracking-tight">Category Sales Distribution</h3>
      <p className="text-xs text-admin-muted">Percentage share of total revenue by collection</p>

      <div className="h-56 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#131720" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#131720',
                borderColor: '#202636',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-admin-border">
        {categoryData.map((cat) => (
          <div key={cat.name} className="flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-admin-muted truncate">{cat.name}</span>
            <span className="font-bold text-white ml-auto">{cat.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
