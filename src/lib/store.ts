import { create } from 'zustand';
import { Product } from '@/types';

interface CompareState {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareItems: [],

  addToCompare: (product: Product) => {
    const { compareItems } = get();
    if (compareItems.some((item) => item.id === product.id)) return;
    if (compareItems.length >= 4) {
      alert('You can compare a maximum of 4 luxury items simultaneously.');
      return;
    }
    set({ compareItems: [...compareItems, product] });
  },

  removeFromCompare: (productId: string) => {
    set((state) => ({
      compareItems: state.compareItems.filter((item) => item.id !== productId),
    }));
  },

  clearCompare: () => set({ compareItems: [] }),

  isInCompare: (productId: string) => {
    return get().compareItems.some((item) => item.id === productId);
  },
}));
