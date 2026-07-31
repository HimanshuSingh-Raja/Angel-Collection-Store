'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Mic,
  Flame,
  Clock,
  Tag,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { searchProductsAction } from '@/actions/search-actions';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendingSearches = [
    'Hand Embroidered Sarees',
    'Organza Silk Sarees',
    'Bridal Lehengas',
    'Cashmere Suits',
    'Italian Leather Totes',
    '18K Gold Jewellery',
  ];

  const popularCategories = [
    { name: 'Sarees', slug: 'sarees', category: 'women' },
    { name: 'Lehengas', slug: 'lehengas', category: 'women' },
    { name: 'Kurtis', slug: 'kurtis', category: 'women' },
    { name: 'Suits & Tuxedos', slug: 'suits', category: 'men' },
  ];

  // Load Search History from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('angel_search_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Save term to search history
  const saveSearchTerm = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem('angel_search_history', JSON.stringify(updated));
    } catch (e) {}
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('angel_search_history');
    } catch (e) {}
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced Search Execution
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchProductsAction({ query: query.trim() });
      if (res.success) {
        setResults(res.products.slice(0, 6));
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const prod = results[selectedIndex];
          saveSearchTerm(query);
          router.push(`/product/${prod.slug}`);
          onClose();
        } else if (query.trim()) {
          saveSearchTerm(query);
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    },
    [results, selectedIndex, query, router, onClose, saveSearchTerm]
  );

  // Web Speech API Voice Search
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (e) {
        alert('Voice search is not supported on this browser.');
      }
    } else {
      alert('Voice search is not supported on this browser.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      <div className="bg-[#0B0E14] border border-[#202736] w-full max-w-3xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden space-y-0 text-xs">
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#202736] flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-[#C8A45D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search luxury sarees, lehengas, suits, handbags..."
            className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-neutral-500 font-sans"
          />

          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#C8A45D]" />
            ) : query ? (
              <button onClick={() => setQuery('')} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition ${
                  isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'text-neutral-400 hover:text-[#C8A45D]'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button onClick={onClose} className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-[#202736]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results / Autocomplete Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
          {query.trim() !== '' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-widest border-b border-[#202736] pb-2 font-mono">
                <span>Matching Products ({results.length})</span>
                <span>Use ↑ ↓ to navigate</span>
              </div>

              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((prod, idx) => {
                    const isSelected = idx === selectedIndex;
                    const catName = typeof prod.category === 'object' ? prod.category?.name : prod.category;
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        onClick={() => {
                          saveSearchTerm(query);
                          onClose();
                        }}
                        className={`flex items-center gap-4 p-3 rounded-2xl border transition group ${
                          isSelected
                            ? 'bg-[#181D29] border-[#C8A45D]'
                            : 'bg-[#121620] border-[#202736] hover:border-[#C8A45D]/60'
                        }`}
                      >
                        <img
                          src={prod.images[0]?.url}
                          alt={prod.title}
                          className="w-14 h-16 object-cover rounded-xl border border-[#202736]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#C8A45D] font-mono">
                            {catName || 'Luxury'}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#C8A45D] transition line-clamp-1">
                            {prod.title}
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                            {formatPrice(prod.price)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-[#C8A45D] transition" />
                      </Link>
                    );
                  })}

                  <button
                    onClick={() => {
                      saveSearchTerm(query);
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                      onClose();
                    }}
                    className="w-full py-3 bg-[#121620] hover:bg-[#181D29] text-[#C8A45D] font-bold text-xs rounded-xl border border-[#202736] transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>View All Search Results for &quot;{query}&quot;</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-neutral-400 text-sm">
                    No luxury items found matching &quot;<span className="text-white font-bold">{query}</span>&quot;
                  </p>
                  <p className="text-xs text-neutral-500">Try searching for &quot;Saree&quot;, &quot;Lehenga&quot;, or &quot;Silk&quot;</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search History */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-widest font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C8A45D]" /> Recent Searches
                    </span>
                    <button onClick={clearHistory} className="text-neutral-500 hover:text-white text-[10px]">
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {history.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-full bg-[#121620] text-neutral-300 hover:bg-[#C8A45D] hover:text-neutral-950 border border-[#202736] font-medium transition text-xs"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#C8A45D] uppercase tracking-widest font-mono font-bold">
                  <Flame className="w-3.5 h-3.5" /> Trending Right Now
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-neutral-950 font-medium transition text-xs"
                    >
                      🔥 {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="space-y-2 pt-2 border-t border-[#202736]">
                <span className="text-[11px] text-neutral-400 uppercase tracking-widest font-mono block">
                  Popular Categories
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {popularCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.category}&type=${cat.slug}`}
                      onClick={onClose}
                      className="p-3 bg-[#121620] hover:bg-[#181D29] rounded-xl border border-[#202736] hover:border-[#C8A45D]/60 transition text-center font-bold text-white"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
