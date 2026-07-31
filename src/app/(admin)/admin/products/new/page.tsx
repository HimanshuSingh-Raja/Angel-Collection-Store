'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smartphone,
  Monitor,
  Plus,
  X,
  Star,
  Tag,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '@/lib/mock-data';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { createProductAction } from '@/actions/product-admin';

export default function NewProductPage() {
  const router = useRouter();

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    sku: '',
    barcode: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    stock: '15',
    reservedStock: '2',
    lowStockThreshold: '5',
    categoryId: INITIAL_CATEGORIES[0]?.id || 'cat-1',
    subcategoryId: '',
    brandId: INITIAL_BRANDS[0]?.id || 'brand-1',
    shortDescription: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
    isFeatured: true,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
  });

  // Specifications State
  const [specs, setSpecs] = useState({
    fabric: '100% Pure Italian Silk Satin',
    work: 'Zardozi Hand Embroidery & Beadwork',
    pattern: 'Solid Couture Silhouette',
    occasion: 'Bridal, Gala & Red Carpet',
    fit: 'Bespoke Tailored Fit',
    sleeves: 'Sleeveless / Spaghetti Straps',
    neck: 'Deep V-Neckline',
    length: 'Floor Length / Floor Sweep Train',
    transparency: 'Opaque with Silk Lining',
    weight: '650 grams',
    manufacturer: 'Angel House Atelier, Mumbai',
    countryOfOrigin: 'India',
    hsnCode: '62044900',
    gstRate: '12%',
  });

  // Color & Size Variant Chips State
  const [availableColors, setAvailableColors] = useState([
    'Midnight Black',
    'Champagne Gold',
    'Royal Ruby',
    'Emerald Green',
    'Pearl White',
    'Blush Pink',
  ]);
  const [selectedColors, setSelectedColors] = useState(['Blush Pink', 'Champagne Gold']);
  const [newColorInput, setNewColorInput] = useState('');

  const [availableSizes, setAvailableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);

  // Media Gallery State
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
  ]);

  // AI Assistant Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // UI Component Toggles & Previews
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto Generate SKU Code
  const handleGenerateSKU = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const categoryPrefix = form.categoryId.substring(0, 3).toUpperCase() || 'ANG';
    setForm((prev) => ({ ...prev, sku: `AC-${categoryPrefix}-2026-${randomNum}` }));
  };

  // Pricing Engine Calculations
  const priceNum = parseFloat(form.price) || 0;
  const compareNum = parseFloat(form.compareAtPrice) || 0;
  const costNum = parseFloat(form.costPrice) || 0;

  const discountPercent = useMemo(() => {
    if (compareNum > priceNum && compareNum > 0) {
      return Math.round(((compareNum - priceNum) / compareNum) * 100);
    }
    return 0;
  }, [priceNum, compareNum]);

  const savingsAmount = useMemo(() => {
    return compareNum > priceNum ? compareNum - priceNum : 0;
  }, [priceNum, compareNum]);

  const netProfit = useMemo(() => {
    return priceNum > costNum && costNum > 0 ? priceNum - costNum : 0;
  }, [priceNum, costNum]);

  const profitMargin = useMemo(() => {
    return priceNum > 0 && costNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : 0;
  }, [priceNum, costNum]);

  // Health Score Calculation
  const healthScore = useMemo(() => {
    let score = 0;
    if (form.title) score += 20;
    if (form.description) score += 20;
    if (form.price) score += 15;
    if (form.sku) score += 10;
    if (images.length >= 2) score += 15;
    if (form.seoTitle && form.seoDescription) score += 10;
    if (selectedColors.length > 0 && selectedSizes.length > 0) score += 10;
    return score;
  }, [form, images, selectedColors, selectedSizes]);

  const missingHealthItems = useMemo(() => {
    const items = [];
    if (!form.title) items.push('Product Title missing');
    if (!form.description) items.push('Detailed Description missing');
    if (images.length < 2) items.push('At least 2 Gallery Images recommended');
    if (!form.seoDescription) items.push('SEO Meta Description missing');
    if (!form.sku) items.push('SKU Code missing');
    return items;
  }, [form, images]);

  // Real Gemini AI Assistant Call
  const handleAiGenerate = async () => {
    setAiGenerating(true);
    try {
      console.log('🤖 Invoking Gemini API via /api/admin/ai/product...');
      const response = await fetch('/api/admin/ai/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          titleHint: form.title,
          categoryHint: form.categoryId,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        setAiAnalysis(data);

        setForm((prev) => ({
          ...prev,
          title: prev.title || data.title,
          slug: prev.slug || data.slug,
          sku: prev.sku || data.sku,
          shortDescription: prev.shortDescription || data.shortDescription,
          description: prev.description || data.description,
          price: prev.price || (data.suggestedPrices?.price ? data.suggestedPrices.price.toString() : '21999'),
          compareAtPrice: prev.compareAtPrice || (data.suggestedPrices?.compareAtPrice ? data.suggestedPrices.compareAtPrice.toString() : '28999'),
          costPrice: prev.costPrice || (data.suggestedPrices?.costPrice ? data.suggestedPrices.costPrice.toString() : '9500'),
          seoTitle: prev.seoTitle || data.seoTitle,
          seoDescription: prev.seoDescription || data.metaDescription,
          metaKeywords: prev.metaKeywords || (Array.isArray(data.tags) ? data.tags.join(', ') : data.tags),
        }));

        if (data.specifications) {
          setSpecs((prev) => ({
            ...prev,
            fabric: data.specifications.fabric || prev.fabric,
            work: data.specifications.work || prev.work,
            pattern: data.specifications.pattern || prev.pattern,
            occasion: data.specifications.occasion || prev.occasion,
            fit: data.specifications.fit || prev.fit,
            transparency: data.specifications.transparency || prev.transparency,
            care: data.specifications.care || data.careInstructions || 'Professional Dry Clean Only',

          }));
        }
      } else {
        alert(result.error || 'AI generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Gemini AI Auto Generate Exception:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };


  const handleAddColor = () => {
    if (newColorInput.trim() && !availableColors.includes(newColorInput.trim())) {
      const formatted = newColorInput.trim();
      setAvailableColors([...availableColors, formatted]);
      setSelectedColors([...selectedColors, formatted]);
      setNewColorInput('');
    }
  };

  const toggleColor = (col: string) => {
    if (selectedColors.includes(col)) {
      setSelectedColors(selectedColors.filter((c) => c !== col));
    } else {
      setSelectedColors([...selectedColors, col]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.sku) {
      alert('Please fill in all required fields (Title, Price, SKU).');
      return;
    }

    setSaving(true);
    try {
      const res = await createProductAction({
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        sku: form.sku,
        barcode: form.barcode,
        price: priceNum,
        compareAtPrice: compareNum || undefined,
        costPrice: costNum || undefined,
        stock: parseInt(form.stock) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || undefined,
        brandId: form.brandId || undefined,
        description: form.description,
        shortDescription: form.shortDescription,
        status: form.status,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
        tags: `${selectedColors.join(',')},${selectedSizes.join(',')}`,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        metaKeywords: form.metaKeywords,
        images: images.map((url, i) => ({ url, isPrimary: i === 0, position: i })),
      });

      if (res.success) {
        router.push('/admin/products');
      } else {
        alert(res.error || 'Failed to save product.');
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while saving the product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans text-xs bg-[#0B0E14] text-neutral-200 p-2 sm:p-6 rounded-3xl min-h-screen">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202736]">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-[#121620] text-neutral-400 hover:text-white border border-[#202736] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-mono text-[#C8A45D] uppercase tracking-[0.25em] font-bold block">
              ENTERPRISE PRODUCT CATALOGUE
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
              Create New Product
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="px-5 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold hover:bg-purple-500/20 transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-purple-400 ${aiGenerating ? 'animate-spin' : ''}`} />
            <span>{aiGenerating ? 'AI ANALYZING IMAGES...' : '✨ AI AUTO GENERATE'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#C8A45D] text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-xl cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 fill-neutral-950" />
            )}
            <span>{saving ? 'SAVING...' : 'SAVE & PUBLISH PRODUCT'}</span>
          </button>
        </div>
      </div>

      {/* 12-COLUMN RESPONSIVE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (70% - 8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Basic Information Card */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-5">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C8A45D]" />
              Basic Product Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blush Pink Hand-Embroidered Organza Silk Saree"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                      seoTitle: `${e.target.value} | Angel Collection`,
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0B0E14] text-white font-medium rounded-xl border border-[#202736] focus:outline-none focus:border-[#C8A45D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B0E14] text-[#C8A45D] font-mono text-[11px] rounded-xl border border-[#202736]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-neutral-300 block">SKU Code *</label>
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="text-[10px] text-[#C8A45D] hover:underline font-bold"
                    >
                      Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="AC-SAR-2026-9812"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B0E14] text-white font-mono rounded-xl border border-[#202736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Barcode / EAN</label>
                  <input
                    type="text"
                    placeholder="890123456789"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B0E14] text-white font-mono rounded-xl border border-[#202736]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Short Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Pure Organza Silk Saree with Handcrafted Zardozi Embroidery"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Detailed Description *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe the fabric, cut, silhouette, handcraftsmanship..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. Media Gallery Drag & Drop */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4">
            <div className="flex items-center justify-between border-b border-[#202736] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-[#C8A45D]" />
                Media & Product Gallery
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">JPG, PNG, WEBP (Max 10MB)</span>
            </div>
            <MediaUploader images={images} onChange={setImages} />
          </div>

          {/* 3. Pricing Engine & Margin Calculator */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-5">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#C8A45D]" />
              Pricing & Net Profit Calculator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="21999"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-white font-mono text-sm rounded-xl border border-[#202736]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">MRP / Compare At (₹)</label>
                <input
                  type="number"
                  placeholder="28999"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-white font-mono text-sm rounded-xl border border-[#202736]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Cost Price (₹)</label>
                <input
                  type="number"
                  placeholder="9500"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-white font-mono text-sm rounded-xl border border-[#202736]"
                />
              </div>
            </div>

            {/* Financial Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#202736] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Discount</span>
                <span className="font-mono text-base font-bold text-amber-400">{discountPercent}% OFF</span>
              </div>
              <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#202736] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Customer Saves</span>
                <span className="font-mono text-base font-bold text-emerald-400">₹{savingsAmount.toLocaleString()}</span>
              </div>
              <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#202736] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Net Profit</span>
                <span className="font-mono text-base font-bold text-emerald-400">₹{netProfit.toLocaleString()}</span>
              </div>
              <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#202736] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Profit Margin</span>
                <span className="font-mono text-base font-bold text-amber-400">{profitMargin}%</span>
              </div>
            </div>
          </div>

          {/* 4. Inventory Management */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C8A45D]" />
              Inventory & Stock Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Total Stock *</label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-white font-mono rounded-xl border border-[#202736]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Reserved Stock</label>
                <input
                  type="number"
                  value={form.reservedStock}
                  onChange={(e) => setForm({ ...form, reservedStock: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-amber-400 font-mono rounded-xl border border-[#202736]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] text-white font-mono rounded-xl border border-[#202736]"
                />
              </div>
            </div>
          </div>

          {/* 5. Product Variants (Color & Size Chips) */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-5">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C8A45D]" />
              Color & Size Variants
            </h3>

            <div className="space-y-3">
              <label className="font-bold text-neutral-300 block uppercase text-[10px] tracking-wider">
                Color Variants
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {availableColors.map((col) => {
                  const isSelected = selectedColors.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleColor(col)}
                      className={`px-3 py-1.5 rounded-full font-bold text-xs border cursor-pointer transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#C8A45D] text-neutral-950 border-[#C8A45D] shadow-md'
                          : 'bg-[#0B0E14] text-neutral-400 border-[#202736] hover:border-neutral-500'
                      }`}
                    >
                      <span>{col}</span>
                      {isSelected && <X className="w-3 h-3 text-neutral-950" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1 max-w-xs">
                <input
                  type="text"
                  placeholder="+ Add Custom Color"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  className="px-3 py-1.5 bg-[#0B0E14] text-white text-xs rounded-xl border border-[#202736]"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-[#202736] hover:bg-neutral-800 text-white rounded-xl font-bold text-xs"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="font-bold text-neutral-300 block uppercase text-[10px] tracking-wider">
                Size Variants
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs border cursor-pointer transition flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#C8A45D] text-neutral-950 border-[#C8A45D] shadow-md'
                          : 'bg-[#0B0E14] text-neutral-400 border-[#202736] hover:border-neutral-500'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Structured Specifications */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C8A45D]" />
              Structured Fashion Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(specs).map((key) => (
                <div key={key}>
                  <label className="font-bold text-neutral-400 block uppercase text-[10px] mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={(specs as any)[key]}
                    onChange={(e) => setSpecs({ ...specs, [key]: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 7. Collapsible SEO & Google Search Snippet Preview */}
          <div className="bg-[#121620] rounded-2xl border border-[#202736] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
              className="w-full p-6 text-left flex items-center justify-between bg-[#121620] hover:bg-[#181d2a] transition cursor-pointer"
            >
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C8A45D]" />
                Search Engine Optimization (SEO) & Google Preview
              </h3>
              {isSeoOpen ? <ChevronUp className="w-5 h-5 text-[#C8A45D]" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
            </button>

            {isSeoOpen && (
              <div className="p-6 pt-0 space-y-5 border-t border-[#202736]">
                <div className="p-4 bg-[#0B0E14] rounded-xl border border-[#202736] space-y-1">
                  <span className="text-[11px] text-emerald-400 font-mono block">
                    https://angelcollection.com/product/{form.slug || 'product-slug'}
                  </span>
                  <h4 className="text-blue-400 text-sm font-bold hover:underline cursor-pointer">
                    {form.seoTitle || form.title || 'Product Title | Angel Collection'}
                  </h4>
                  <p className="text-neutral-400 text-xs leading-snug">
                    {form.seoDescription || form.shortDescription || 'Product Meta Description preview will appear here in Google Search results.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-neutral-300 block mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      placeholder="Blush Pink Hand-Embroidered Organza Silk Saree | Angel Collection"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-300 block mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      placeholder="Shop the exquisite Blush Pink Hand-Embroidered Organza Silk Saree..."
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-300 block mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      placeholder="organza saree, silk saree, wedding saree"
                      value={form.metaKeywords}
                      onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (30% - 4 COLS - STICKY SIDEBAR) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Insights & Vision Assistant Card */}
          {aiAnalysis && (
            <div className="bg-purple-950/30 p-6 rounded-2xl border border-purple-500/40 space-y-3 text-purple-200">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-purple-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  AI VISION INSIGHTS
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                  {aiAnalysis.confidence || aiAnalysis.aiConfidence || 95}% CONFIDENCE
                </span>
              </div>

              <div className="text-xs space-y-1 pt-1">
                <p><strong>Fabric Detected:</strong> {aiAnalysis.detectedAttributes?.fabric || aiAnalysis.fabric || '100% Pure Organza Silk'}</p>
                <p><strong>Work / Embroidery:</strong> {aiAnalysis.detectedAttributes?.work || aiAnalysis.specifications?.work || 'Hand-Embroidered Zardozi & Resham Threads'}</p>
                <p><strong>Category:</strong> {aiAnalysis.detectedAttributes?.category || aiAnalysis.category || 'Sarees'}</p>
              </div>
            </div>
          )}


          {/* Product Health Score Card */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white">Product Health Score</h3>
              <span className="px-2.5 py-1 rounded-full bg-[#C8A45D]/20 text-[#C8A45D] font-mono font-bold text-xs border border-[#C8A45D]/30">
                {healthScore}% COMPLETE
              </span>
            </div>

            <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden border border-[#202736]">
              <div
                className="bg-[#C8A45D] h-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>

            {missingHealthItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Recommended Fixes:</span>
                {missingHealthItems.map((item, i) => (
                  <p key={i} className="text-[11px] text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Product Status & Category */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4">
            <h3 className="font-serif text-base font-bold text-white">Publishing & Status</h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-neutral-400 block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736] font-bold"
                >
                  <option value="PUBLISHED">PUBLISHED (Active on Store)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-400 block mb-1">Primary Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                >
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-400 block mb-1">Designer Brand</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B0E14] text-white rounded-xl border border-[#202736]"
                >
                  {INITIAL_BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="pt-3 border-t border-[#202736] space-y-2.5">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="accent-[#C8A45D] w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-medium">Featured Collection</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isTrending}
                  onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
                  className="accent-[#C8A45D] w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-medium">Trending Showcase</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  className="accent-[#C8A45D] w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-medium">New Arrival Badge</span>
              </label>
            </div>
          </div>

          {/* Live Storefront Customer Preview */}
          <div className="bg-[#121620] p-6 rounded-2xl border border-[#202736] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C8A45D]" />
                Customer Card Preview
              </h3>

              <div className="flex items-center bg-[#0B0E14] p-1 rounded-xl border border-[#202736]">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-lg transition ${previewMode === 'desktop' ? 'bg-[#202736] text-[#C8A45D]' : 'text-neutral-500'}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-lg transition ${previewMode === 'mobile' ? 'bg-[#202736] text-[#C8A45D]' : 'text-neutral-500'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={`mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl text-neutral-900 border border-neutral-200 transition-all ${previewMode === 'mobile' ? 'max-w-[240px]' : 'w-full'}`}>
              <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {discountPercent > 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-neutral-950 text-[#C8A45D] font-bold text-[9px]">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-neutral-400 font-mono uppercase">ATELIER COUTURE</p>
                <h5 className="font-serif font-bold text-xs line-clamp-1 text-neutral-900">
                  {form.title || 'Blush Pink Organza Saree'}
                </h5>
                <div className="flex items-center space-x-2 font-bold text-xs pt-1">
                  <span className="text-amber-800">₹{(priceNum || 21999).toLocaleString()}</span>
                  {compareNum > priceNum && (
                    <span className="text-neutral-400 line-through text-[10px]">₹{compareNum.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
