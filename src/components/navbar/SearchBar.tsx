'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Mic, ArrowUpRight, Clock, Flame, Tag, ChevronRight, Loader2 } from 'lucide-react';
import { searchProductsAction } from '@/actions/search-actions';
import { formatPrice } from '@/lib/utils';

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendingSearches = ['Organza Sarees', 'Silk Lehengas', 'Tuxedos', 'Leather Bags', 'Diamond Rings'];
  const popularCategories = ['Women Couture', 'Men Heritage', 'Accessories', 'Festive Edit'];

  // Load Search History
  useEffect(() => {
    try {
      const saved = localStorage.getItem('angel_search_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 4);
    setHistory(updated);
    try {
      localStorage.setItem('angel_search_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const removeHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== term);
    setHistory(updated);
    try {
      localStorage.setItem('angel_search_history', JSON.stringify(updated));
    } catch (e) {}
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Debounced Search
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
        setResults(res.products.slice(0, 5));
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      saveSearchTerm(query.trim());
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

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
          setIsOpen(true);
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

  return (
    <div ref={containerRef} className="relative w-full max-w-lg font-sans text-xs">
      {/* 48px Pill Search Bar */}
      <div
        className={`relative h-12 flex items-center bg-white rounded-full border transition-all duration-300 ${
          isOpen
            ? 'border-neutral-400 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
            : 'border-neutral-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:border-neutral-300'
        }`}
      >
        <Search className="w-4 h-4 absolute left-4 text-neutral-400 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search luxury fashion..."
          className="w-full h-full pl-11 pr-20 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium tracking-wide"
        />

        <div className="absolute right-3.5 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-900 transition rounded-full"
              aria-label="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full transition ${
                isListening ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-neutral-400 hover:text-neutral-900'
              }`}
              title="Voice Search"
              aria-label="Voice search"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MINIMAL LUXURY DROPDOWN (APPLE / ZARA INSPIRED) */}
      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-4 sm:p-5 z-50 animate-fadeIn font-sans space-y-4 max-h-[75vh] overflow-y-auto">
          {query.trim() !== '' ? (
            /* SEARCH RESULTS ROWS */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">
                <span>Matching Items ({results.length})</span>
                {loading && <span>Searching...</span>}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1.5">
                  {results.map((prod) => {
                    const brandName = typeof prod.brand === 'object' ? prod.brand?.name : 'Angel Collection';
                    const categoryName = typeof prod.category === 'object' ? prod.category?.name : prod.category;
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        onClick={() => {
                          saveSearchTerm(query);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-neutral-50 transition border border-transparent hover:border-neutral-100 group"
                      >
                        {/* 56x56 Thumbnail Image */}
                        <img
                          src={prod.images[0]?.url}
                          alt={prod.title}
                          className="w-14 h-14 object-cover object-center rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                        />

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
                            {brandName} • {categoryName}
                          </span>
                          <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-amber-800 transition line-clamp-1">
                            {prod.title}
                          </h4>
                          <span className="text-xs font-bold text-neutral-900 mt-0.5 block">
                            {formatPrice(prod.price)}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition shrink-0" />
                      </Link>
                    );
                  })}

                  {/* View All Button */}
                  <button
                    onClick={() => {
                      saveSearchTerm(query);
                      setIsOpen(false);
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="w-full py-2.5 mt-2 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>View all results for &quot;{query}&quot;</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              ) : !loading ? (
                <div className="py-8 text-center space-y-1">
                  <p className="text-neutral-500 text-xs font-medium">No results found for &quot;{query}&quot;</p>
                  <p className="text-[11px] text-neutral-400">Try searching for &quot;Saree&quot;, &quot;Silk&quot; or &quot;Lehenga&quot;</p>
                </div>
              ) : null}
            </div>
          ) : (
            /* EMPTY STATE MINIMAL CHIPS (APPLE / ZARA TYPE) */
            <div className="space-y-4 text-xs">
              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((term) => (
                      <span
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          setIsOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 transition cursor-pointer text-[11px] font-medium"
                      >
                        {term}
                        <button
                          onClick={(e) => removeHistoryItem(e, term)}
                          className="hover:text-rose-400 transition"
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
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-amber-700" />
                  <span>Trending Right Now</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        setIsOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-full bg-neutral-50 hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-100 transition text-[11px] font-medium cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  <span>Categories</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/shop?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 rounded-xl bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 font-medium transition border border-neutral-100/60 flex items-center justify-between group"
                    >
                      <span>{cat}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
