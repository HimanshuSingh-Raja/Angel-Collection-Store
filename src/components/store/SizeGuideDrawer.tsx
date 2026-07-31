'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideDrawer: React.FC<SizeGuideDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-neutral-200 animate-slide-up">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-neutral-900">Haute Couture Size Guide</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-neutral-600">All measurements are listed in inches. For custom bespoke tailoring, please contact our concierge.</p>

          <table className="w-full text-left border-collapse border border-neutral-200">
            <thead>
              <tr className="bg-neutral-100 font-bold uppercase text-neutral-800 border-b border-neutral-200">
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Bust / Chest</th>
                <th className="p-2.5">Waist</th>
                <th className="p-2.5">Hips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-700">
              <tr>
                <td className="p-2.5 font-bold">XS (0-2)</td>
                <td className="p-2.5">31.5 - 32.5&quot;</td>
                <td className="p-2.5">24 - 25&quot;</td>
                <td className="p-2.5">34.5 - 35.5&quot;</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">S (4-6)</td>
                <td className="p-2.5">33.5 - 34.5&quot;</td>
                <td className="p-2.5">26 - 27&quot;</td>
                <td className="p-2.5">36.5 - 37.5&quot;</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">M (8-10)</td>
                <td className="p-2.5">35.5 - 36.5&quot;</td>
                <td className="p-2.5">28 - 29&quot;</td>
                <td className="p-2.5">38.5 - 39.5&quot;</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">L (12-14)</td>
                <td className="p-2.5">38 - 39.5&quot;</td>
                <td className="p-2.5">30.5 - 32&quot;</td>
                <td className="p-2.5">41 - 42.5&quot;</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">XL (16)</td>
                <td className="p-2.5">41 - 43&quot;</td>
                <td className="p-2.5">33.5 - 35&quot;</td>
                <td className="p-2.5">44 - 45.5&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
