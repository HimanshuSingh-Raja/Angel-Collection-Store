'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getProductForEditAction, updateProductAction, deleteProductAction } from '@/actions/product-admin';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '@/lib/mock-data';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Images state
  const [images, setImages] = useState<Array<{ url: string; isPrimary?: boolean; position?: number }>>([]);

  // Variants state
  const [variants, setVariants] = useState<Array<{ size: string; color: string; price: number; stock: number; sku: string }>>([]);

  // Load existing product record from PostgreSQL
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await getProductForEditAction(productId);
        if (!prod) {
          setErrorMessage('Product not found in database.');
          setLoading(false);
          return;
        }

        setTitle(prod.title || '');
        setSlug(prod.slug || '');
        setSku(prod.sku || '');
        setBarcode(prod.barcode || '');
        setDescription(prod.description || '');
        setShortDescription(prod.shortDescription || '');
        setPrice(prod.price ?? '');
        setCompareAtPrice(prod.compareAtPrice || '');
        setCostPrice(prod.costPrice || '');
        setStock(prod.stock ?? 0);
        setLowStockThreshold(prod.lowStockThreshold ?? 5);
        setCategoryId(prod.categoryId || INITIAL_CATEGORIES[0].id);
        setSubcategoryId(prod.subcategoryId || '');
        setBrandId(prod.brandId || INITIAL_BRANDS[0].id);
        setStatus(prod.status as any || 'PUBLISHED');
        setIsFeatured(!!prod.isFeatured);
        setIsTrending(!!prod.isTrending);
        setIsBestSeller(!!prod.isBestSeller);
        setIsNewArrival(!!prod.isNewArrival);
        setTags(prod.tags || '');
        setSeoTitle(prod.seoTitle || '');
        setSeoDescription(prod.seoDescription || '');
        setMetaKeywords(prod.metaKeywords || '');
        setImages(prod.images || []);
        setVariants(prod.variants || []);
      } catch (err) {
        console.error('Failed to fetch product for edit:', err);
        setErrorMessage('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  // Unsaved changes listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Financial Calculations
  const pVal = typeof price === 'number' ? price : 0;
  const cVal = typeof compareAtPrice === 'number' ? compareAtPrice : 0;
  const costVal = typeof costPrice === 'number' ? costPrice : 0;
  const discountPercent = cVal > pVal ? Math.round(((cVal - pVal) / cVal) * 100) : 0;
  const netProfit = pVal > costVal ? pVal - costVal : 0;
  const marginPercent = pVal > 0 ? Math.round((netProfit / pVal) * 100) : 0;

  // Add Variant Handler
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: 'M', color: 'Black', price: pVal, stock: 10, sku: `${sku}-VAR-${prev.length + 1}` },
    ]);
    setIsDirty(true);
  };

  const handleDeleteVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // AI Auto Generate Handler
  const handleAiAutoGenerate = async () => {
    if (images.length === 0) {
      alert('Please upload at least one product image before running AI auto generation.');
      return;
    }

    if (isDirty && !confirm('✨ AI Auto Generate will update the title, description, and SEO tags. Proceed?')) {
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/admin/ai/product', {
        method: 'POST',
        headers: { 'Content-[#Type]': 'application/json' },
        body: JSON.stringify({ images: images.map((img) => img.url), currentTitle: title }),
      });
      const data = await response.json();

      if (data.success && data.result) {
        const ai = data.result;
        setTitle(ai.title || title);
        setDescription(ai.description || description);
        setTags(ai.tags || tags);
        setSeoTitle(ai.seoTitle || seoTitle);
        setSeoDescription(ai.seoDescription || seoDescription);
        setIsDirty(true);
      }
    } catch (err) {
      console.error('AI Auto Generate failed:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save Changes Handler
  const handleSaveChanges = async (targetStatus?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Product Title is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMessage('Product SKU is required.');
      return;
    }
    if (typeof price !== 'number' || price <= 0) {
      setErrorMessage('Product Price must be greater than ₹0.');
      return;
    }
    if (typeof stock !== 'number' || stock < 0) {
      setErrorMessage('Product Stock cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      const finalStatus = targetStatus || status;
      const res = await updateProductAction({
        id: productId,
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        description,
        shortDescription,
        price: Number(price),
        compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : undefined,
        costPrice: costPrice !== '' ? Number(costPrice) : undefined,
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        categoryId: categoryId || INITIAL_CATEGORIES[0].id,
        subcategoryId: subcategoryId || undefined,
        brandId: brandId || INITIAL_BRANDS[0].id,
        status: finalStatus,
        isFeatured,
        isTrending,
        isBestSeller,
        isNewArrival,
        tags,
        seoTitle,
        seoDescription,
        metaKeywords,
        images: images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', isPrimary: true, position: 0 }],
        variants,
      });

      if (res.success) {
        setIsDirty(false);
        setSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to update product.');
      }
    } catch (err: any) {
      console.error('Error saving product changes:', err);
      setErrorMessage(err.message || 'An error occurred while saving changes.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async () => {
    if (confirm('⚠️ PERMANENT DELETION: Are you sure you want to delete this product from PostgreSQL DB?')) {
      setDeleting(true);
      const res = await deleteProductAction(productId);
      if (res.success) {
        router.push('/admin/products');
      } else {
        alert(res.error || 'Failed to delete product.');
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-admin-muted text-xs gap-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span>Loading product specifications from PostgreSQL DB...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-admin-card text-admin-muted hover:text-white border border-admin-border transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
              SELLER HUB EDIT MODULE
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
              Edit Product: <span className="text-amber-300">{title}</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="px-4 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Delete</span>
          </button>

          <Link
            href={`/product/${slug}`}
            target="_blank"
            className="px-4 py-2.5 bg-admin-card text-admin-muted hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-admin-border transition"
          >
            <Eye className="w-4 h-4 text-amber-400" /> Preview
          </Link>

          <button
            onClick={() => handleSaveChanges('DRAFT')}
            disabled={saving}
            className="px-4 py-2.5 bg-admin-card text-admin-muted hover:text-white rounded-xl text-xs font-bold border border-admin-border transition cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            onClick={() => handleSaveChanges('PUBLISHED')}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')}>
            <X className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      )}

      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (70% = 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              1. Basic Product Specifications
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Product Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-4 py-2.5 bg-admin-bg text-sm text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Blush Pink Hand-Embroidered Organza Silk Saree"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                    SKU Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                    Barcode / EAN
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Description */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              2. Product Description & Craftsmanship Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Full Story & Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full p-3 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Short Highlight Summary
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Pricing & Live Margin Calculator */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              3. Pricing & Financial Margin Calculator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Selling Price (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value !== '' ? Number(e.target.value) : '');
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Compare At Price / MRP (₹)
                </label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => {
                    setCompareAtPrice(e.target.value !== '' ? Number(e.target.value) : '');
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">
                  Cost Per Item (₹)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => {
                    setCostPrice(e.target.value !== '' ? Number(e.target.value) : '');
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Financial Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-admin-bg rounded-xl border border-admin-border text-center text-xs">
              <div>
                <span className="text-[10px] text-admin-muted block">Discount %</span>
                <span className="font-bold text-rose-400">{discountPercent}% OFF</span>
              </div>
              <div>
                <span className="text-[10px] text-admin-muted block">Net Profit</span>
                <span className="font-bold text-emerald-400">{formatPrice(netProfit)}</span>
              </div>
              <div>
                <span className="text-[10px] text-admin-muted block">Margin %</span>
                <span className="font-bold text-amber-400">{marginPercent}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Professional Media Uploader */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <div className="flex justify-between items-center border-b border-admin-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                4. High-Resolution Media & Gallery Management
              </h3>
              <span className="text-[10px] text-admin-muted font-mono">{images.length} / 20 Uploaded Images</span>
            </div>

            <MediaUploader
              images={images.map((img) => img.url)}
              onChange={(newUrls) => {
                setImages(newUrls.map((url, i) => ({ url, isPrimary: i === 0, position: i })));
                setIsDirty(true);
              }}
              maxFiles={20}
            />
          </div>

          {/* Card 5: Product Variants */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <div className="flex justify-between items-center border-b border-admin-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                5. Product Variants (Size & Color Matrix)
              </h3>
              <button
                onClick={handleAddVariant}
                className="px-3 py-1 bg-admin-bg text-amber-400 hover:text-white text-xs font-bold rounded-lg border border-admin-border transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            {variants.length > 0 ? (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-5 gap-3 p-3 bg-admin-bg rounded-xl border border-admin-border items-center text-xs">
                    <div>
                      <span className="text-[10px] text-admin-muted block">Size</span>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, size: val } : item)));
                          setIsDirty(true);
                        }}
                        className="w-full px-2 py-1 bg-admin-card text-white rounded border border-admin-border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-admin-muted block">Color</span>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, color: val } : item)));
                          setIsDirty(true);
                        }}
                        className="w-full px-2 py-1 bg-admin-card text-white rounded border border-admin-border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-admin-muted block">Price (₹)</span>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, price: val } : item)));
                          setIsDirty(true);
                        }}
                        className="w-full px-2 py-1 bg-admin-card text-white rounded border border-admin-border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-admin-muted block">Stock</span>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVariants((prev) => prev.map((item, idx) => (idx === i ? { ...item, stock: val } : item)));
                          setIsDirty(true);
                        }}
                        className="w-full px-2 py-1 bg-admin-card text-white rounded border border-admin-border text-xs font-bold"
                      />
                    </div>
                    <div className="text-right pt-3">
                      <button
                        onClick={() => handleDeleteVariant(i)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-admin-muted italic">No variants created yet. Default single product listing active.</p>
            )}
          </div>

          {/* Card 6: SEO & SERP Snippet Preview */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              6. Search Engine Optimization (SEO & SERP Preview)
            </h3>

            {/* Google SERP Preview Box */}
            <div className="p-4 bg-admin-bg rounded-xl border border-admin-border space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono">https://angelcollection.in/product/{slug}</span>
              <h4 className="text-sm font-semibold text-blue-400 line-clamp-1">{seoTitle || title}</h4>
              <p className="text-xs text-neutral-400 line-clamp-2">{seoDescription || description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">SEO Description</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full p-3 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (30% = 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ✨ AI AUTO GENERATE CARD */}
          <div className="p-5 bg-gradient-to-br from-amber-950/40 via-admin-card to-admin-card rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="font-serif font-bold text-white text-base">AI Listing Generator</h4>
            </div>
            <p className="text-xs text-admin-muted">
              Auto-generate product titles, descriptions, SEO tags, and alt texts using Google Gemini AI.
            </p>

            <button
              onClick={handleAiAutoGenerate}
              disabled={aiGenerating}
              className="w-full py-3 bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>✨ AI AUTO GENERATE</span>
            </button>
          </div>

          {/* Visibility & Status Card */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              Publishing Visibility
            </h4>

            <div>
              <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="PUBLISHED">PUBLISHED (Live Storefront)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
              </select>
            </div>

            {/* Feature Flags Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-admin-border text-xs">
              <label className="flex items-center space-x-2 text-admin-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 text-admin-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => {
                    setIsTrending(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">Trending Collection</span>
              </label>

              <label className="flex items-center space-x-2 text-admin-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => {
                    setIsBestSeller(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">Best Seller Flag</span>
              </label>

              <label className="flex items-center space-x-2 text-admin-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => {
                    setIsNewArrival(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">New Arrival Flag</span>
              </label>
            </div>
          </div>

          {/* Category & Brand Card */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              Category & Brand Taxonomy
            </h4>

            <div>
              <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              >
                {INITIAL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1.5">Brand</label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              >
                {INITIAL_BRANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-admin-border pb-2">
              Product Tags
            </h4>
            <input
              type="text"
              placeholder="e.g. saree, organza, silk, luxury"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-admin-card border border-amber-500/40 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-white">✅ Product Updated Successfully</h3>
              <p className="text-xs text-admin-muted">
                Changes have been saved to PostgreSQL and synced across live storefront routes.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={`/product/${slug}`}
                target="_blank"
                className="py-3 bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition"
              >
                View Live Product Page
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="py-3 bg-admin-bg text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-admin-border hover:bg-admin-hover transition cursor-pointer"
              >
                Continue Editing
              </button>
              <Link
                href="/admin/products"
                className="py-3 bg-admin-bg text-admin-muted font-bold text-xs uppercase tracking-wider rounded-xl hover:text-white transition"
              >
                Back to All Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
