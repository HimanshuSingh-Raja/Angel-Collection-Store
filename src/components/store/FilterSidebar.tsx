'use client';

import React from 'react';
import { RotateCcw, Check, Star } from 'lucide-react';
import { FilterState } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '@/lib/mock-data';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
}

const AVAILABLE_COLORS = ['Midnight Black', 'Champagne Gold', 'Emerald Green', 'Oatmeal Camel', 'Cognac Tan', 'Rose Gold'];
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '38R', '40R', '42R', '18 inch'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, resetFilters }) => {
  const toggleColor = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const toggleSize = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  return (
    <aside className="w-full space-y-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">Refine Collection</h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-neutral-500 hover:text-amber-800 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
            className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition font-medium ${
              filters.category === '' ? 'bg-neutral-900 text-amber-300 font-bold' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Categories
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug }))}
              className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition font-medium flex items-center justify-between ${
                filters.category === cat.slug ? 'bg-neutral-900 text-amber-300 font-bold' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Designer Brand</h4>
        <div className="space-y-2">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, brand: '' }))}
            className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition font-medium ${
              filters.brand === '' ? 'bg-neutral-900 text-amber-300 font-bold' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Brands
          </button>
          {INITIAL_BRANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setFilters((prev) => ({ ...prev, brand: b.slug }))}
              className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition font-medium ${
                filters.brand === b.slug ? 'bg-neutral-900 text-amber-300 font-bold' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Max Price</h4>
          <span className="text-xs font-bold text-amber-800">₹{filters.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="5000"
          max="60000"
          step="2000"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-amber-700 cursor-pointer"
        />
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Color Swatches</h4>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COLORS.map((color) => {
            const selected = filters.colors.includes(color);
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                  selected
                    ? 'bg-neutral-900 text-amber-300 border-neutral-900'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {selected && <Check className="w-3 h-3 text-amber-400" />}
                <span>{color}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => {
            const selected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-10 h-10 rounded-xl text-xs font-bold border transition ${
                  selected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle Toggles */}
      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, onSaleOnly: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-neutral-300"
          />
          <span className="text-xs font-semibold text-neutral-800">Privilege Deals & Sales Only</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-neutral-300"
          />
          <span className="text-xs font-semibold text-neutral-800">In Stock Ready To Ship</span>
        </label>
      </div>
    </aside>
  );
};
