'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Mic,
  Flame,
  Clock,
  ChevronRight,
  ArrowRight,
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
  const [mounted, setMounted] = useState(false);
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
    { name: 'Sarees & Couture', slug: 'women' },
    { name: 'Bridal Lehengas', slug: 'women' },
    { name: 'Men Suits & Tuxedos', slug: 'men' },
    { name: 'Artisanal Handbags', slug: 'bags' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('angel_search_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveSearchTerm = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem('angel_search_history', JSON.stringify(updated));
    } catch (e) {}
  }, [history]);

  const removeHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== term);
    setHistory(updated);
    try {
      localStorage.setItem('angel_search_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('angel_search_history');
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchProductsAction({ query: query.trim() });
        if (res?.success && Array.isArray(res.products)) {
          setResults(res.products.slice(0, 6));
        } else {
          setResults([]);
        }
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-start justify-center pt-4 sm:pt-16 px-3 sm:px-4 font-sans">
      <div className="bg-white border border-neutral-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden space-y-0 text-xs z-[101]">
        {/* Top Search Bar Row */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3 relative bg-white">
          <Search className="w-5 h-5 text-amber-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories..."
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 focus:outline-none placeholder:text-neutral-400 font-medium"
          />

          <div className="flex items-center gap-2 shrink-0">
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-full"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition ${
                  isListening ? 'bg-rose-50 text-rose-600 animate-pulse' : 'text-neutral-400 hover:text-amber-800'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:text-neutral-950 font-bold min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results / Autocomplete Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {query.trim() !== '' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 font-mono">
                <span>Matching Catalogue</span>
                {!loading && <span>{results.length} items found</span>}
              </div>

              {/* Skeleton Loader during fetch */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-50 animate-pulse">
                      <div className="w-14 h-16 bg-neutral-200 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-1/4" />
                        <div className="h-4 bg-neutral-200 rounded w-3/4" />
                        <div className="h-3 bg-neutral-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((prod, idx) => {
                    const isSelected = idx === selectedIndex;
                    const catName = typeof prod.category === 'object' ? prod.category?.name : prod.category;
                    const brandName = typeof prod.brand === 'object' ? prod.brand?.name : 'Angel Sovereign';
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        onClick={() => {
                          saveSearchTerm(query);
                          onClose();
                        }}
                        className={`flex items-center gap-3.5 p-2.5 rounded-2xl border transition group ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500'
                            : 'bg-white border-neutral-100 hover:border-amber-400/60 hover:bg-neutral-50'
                        }`}
                      >
                        {/* 4:5 Aspect Thumbnail */}
                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                          <img
                            src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300'}
                            alt={prod.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                            {brandName} • {catName || 'Luxury'}
                          </span>
                          <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-amber-900 transition line-clamp-1 mt-0.5">
                            {highlightMatch(prod.title, query)}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-neutral-950">
                              {formatPrice(prod.price)}
                            </span>
                            {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(prod.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition shrink-0" />
                      </Link>
                    );
                  })}

                  <button
                    onClick={() => {
                      saveSearchTerm(query);
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                      onClose();
                    }}
                    className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-3 min-h-[44px]"
                  >
                    <span>View all results for &quot;{query}&quot;</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 bg-neutral-50 rounded-2xl p-6">
                  <p className="text-neutral-700 text-xs font-semibold">
                    No items found matching &quot;<span className="text-amber-800 font-bold">{query}</span>&quot;
                  </p>
                  <p className="text-[11px] text-neutral-400">Try searching for &quot;Saree&quot;, &quot;Lehenga&quot;, &quot;Bag&quot; or &quot;Silk&quot;</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> Recent Searches
                    </span>
                    <button onClick={clearHistory} className="text-neutral-400 hover:text-neutral-950 text-[10px]">
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {history.map((term) => (
                      <span
                        key={term}
                        onClick={() => setQuery(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 font-medium transition cursor-pointer text-xs min-h-[36px]"
                      >
                        {term}
                        <button
                          onClick={(e) => removeHistoryItem(e, term)}
                          className="hover:text-rose-400 transition ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-800 uppercase tracking-widest font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-600" /> Trending Right Now
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-2 rounded-full bg-amber-50/80 text-amber-950 border border-amber-200/80 hover:bg-amber-700 hover:text-white font-medium transition text-xs cursor-pointer min-h-[36px]"
                    >
                      🔥 {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono block font-bold">
                  Popular Categories
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {popularCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/shop?category=${cat.slug}`}
                      onClick={onClose}
                      className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200/60 transition flex items-center justify-between font-semibold text-neutral-900 text-xs min-h-[44px]"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
