'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import { ProductCard } from '@/components/store/ProductCard';
import { QuickViewModal } from '@/components/store/QuickViewModal';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { Product, FilterState } from '@/types';
import { SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { getStorefrontProductsAction } from '@/actions/product-store';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams?.get('category') || '';
  const initialType = searchParams?.get('type') || searchParams?.get('subcategory') || '';
  const initialSale = searchParams?.get('onSale') === 'true';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCat,
    subcategory: initialType,
    brand: '',
    minPrice: 0,
    maxPrice: 60000,
    colors: [],
    sizes: [],
    rating: 0,
    inStockOnly: false,
    onSaleOnly: initialSale,
    sortBy: 'newest',
    searchQuery: '',
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync state when URL searchParams change
  useEffect(() => {
    const catFromUrl = searchParams?.get('category') || '';
    const typeFromUrl = searchParams?.get('type') || searchParams?.get('subcategory') || '';
    setFilters((prev) => ({
      ...prev,
      category: catFromUrl,
      subcategory: typeFromUrl,
    }));
  }, [searchParams]);

  // Fetch live published products from PostgreSQL matching category AND type/subcategory
  useEffect(() => {
    async function loadLiveProducts() {
      setLoading(true);
      try {
        const dbProducts = await getStorefrontProductsAction({
          category: filters.category || undefined,
          type: filters.subcategory || undefined,
          subcategory: filters.subcategory || undefined,
          search: filters.searchQuery || undefined,
        });

        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts as any);
        } else {
          // Fallback to filtering initial mock dataset with singular/plural normalization
          const filteredMock = (INITIAL_PRODUCTS as any[]).filter((p) => {
            if (filters.category && p.category?.slug !== filters.category && p.category?.name?.toLowerCase() !== filters.category.toLowerCase()) {
              return false;
            }
            if (filters.subcategory) {
              const typeTerm = filters.subcategory.toLowerCase().trim();
              const singularTerm = typeTerm.endsWith('s') ? typeTerm.slice(0, -1) : typeTerm;
              const subcatSlug = p.subcategory?.slug?.toLowerCase();
              const subcatName = p.subcategory?.name?.toLowerCase();
              const titleLower = p.title.toLowerCase();
              const tagLower = p.tags?.toLowerCase() || '';

              const isMatch =
                subcatSlug === typeTerm ||
                subcatSlug === singularTerm ||
                subcatName?.includes(typeTerm) ||
                subcatName?.includes(singularTerm) ||
                titleLower.includes(typeTerm) ||
                titleLower.includes(singularTerm) ||
                tagLower.includes(typeTerm) ||
                tagLower.includes(singularTerm);

              if (!isMatch) return false;
            }
            return true;
          });
          setProductsList(filteredMock as any);
        }
      } catch (err) {
        console.error('Failed to load DB products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveProducts();
  }, [filters.category, filters.subcategory, filters.searchQuery]);

  const resetFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      brand: '',
      minPrice: 0,
      maxPrice: 60000,
      colors: [],
      sizes: [],
      rating: 0,
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'newest',
      searchQuery: '',
    });
  };

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((prod) => {
        if (filters.category && prod.category?.slug !== filters.category && prod.category?.name?.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
        if (filters.subcategory) {
          const typeTerm = filters.subcategory.toLowerCase().trim();
          const singularTerm = typeTerm.endsWith('s') ? typeTerm.slice(0, -1) : typeTerm;
          const subcatSlug = prod.subcategory?.slug?.toLowerCase();
          const subcatName = prod.subcategory?.name?.toLowerCase();
          const titleLower = prod.title.toLowerCase();
          const tagLower = prod.tags?.toLowerCase() || '';

          const isMatch =
            subcatSlug === typeTerm ||
            subcatSlug === singularTerm ||
            subcatName?.includes(typeTerm) ||
            subcatName?.includes(singularTerm) ||
            titleLower.includes(typeTerm) ||
            titleLower.includes(singularTerm) ||
            tagLower.includes(typeTerm) ||
            tagLower.includes(singularTerm);

          if (!isMatch) return false;
        }
        if (filters.brand && prod.brand?.slug !== filters.brand) return false;
        if (prod.price > filters.maxPrice) return false;
        if (filters.onSaleOnly && (!prod.compareAtPrice || prod.compareAtPrice <= prod.price)) return false;
        if (filters.inStockOnly && prod.stock <= 0) return false;
        if (filters.colors.length > 0 && !prod.colors?.some((c) => filters.colors.includes(c))) return false;
        if (filters.sizes.length > 0 && !prod.sizes?.some((s) => filters.sizes.includes(s))) return false;
        if (
          filters.searchQuery &&
          !prod.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !prod.tags?.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-low') return a.price - b.price;
        if (filters.sortBy === 'price-high') return b.price - a.price;
        if (filters.sortBy === 'popularity') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [productsList, filters]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 font-sans pb-24">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-10 text-center sm:text-left border-b border-neutral-200 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-amber-700">EXCLUSIVE CATALOGUE</span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-1 capitalize">
            {filters.category ? `${filters.category} ${filters.subcategory ? '› ' + filters.subcategory : 'Collection'}` : 'The Haute Couture Shop'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Showing {filteredProducts.length} luxury products</p>
        </div>

        {/* Sort & Filter Drawer Trigger */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex-1 py-2.5 px-4 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="py-2.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-600 cursor-pointer shadow-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>

        {/* Products Grid (2 columns on Mobile <640px, 3 on Desktop) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
              <span>Fetching matching catalogue...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-100 p-8 space-y-4">
              <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-neutral-900">No luxury items match your criteria</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try loosening your search query, price slider, or subcategory filters to view more items.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-700 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Drawer Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Mobile Filter Slide Bottom Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
              <h3 className="font-serif text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-xs font-bold text-neutral-500 cursor-pointer">
                Close
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}
