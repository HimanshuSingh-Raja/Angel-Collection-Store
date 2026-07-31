'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Info,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import { INITIAL_BANNERS } from '@/lib/mock-data';
import { Banner } from '@/types';
import {
  getAdminBannersAction,
  createBannerAction,
  deleteBannerAction,
  updateBannerAction,
} from '@/actions/banner-admin';

interface BannerMetadata {
  width: number;
  height: number;
  fileSizeMb: string;
  format: string;
  aspectRatio: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('/shop?category=women');
  const [category, setCategory] = useState<
    'HERO_SLIDER' | 'OFFER_BANNER' | 'FESTIVAL_BANNER' | 'COLLECTION_BANNER' | 'POPUP_BANNER'
  >('HERO_SLIDER');
  const [imageUrl, setImageUrl] = useState('');

  // Image Metadata & Validation
  const [metadata, setMetadata] = useState<BannerMetadata | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch live banners from PostgreSQL
  useEffect(() => {
    async function loadBanners() {
      setLoading(true);
      try {
        const liveBanners = await getAdminBannersAction();
        if (liveBanners && liveBanners.length > 0) {
          setBanners(liveBanners as any);
        } else {
          setBanners(INITIAL_BANNERS);
        }
      } catch (err) {
        console.error('Failed to load banners from DB:', err);
        setBanners(INITIAL_BANNERS);
      } finally {
        setLoading(false);
      }
    }

    loadBanners();
  }, []);

  // Handle Banner Image File Selection & Dimension Validation
  const handleBannerFileSelect = async (files: FileList | File[]) => {
    setValidationError(null);
    setSuccessMsg(null);
    setMetadata(null);

    const file = files[0];
    if (!file) return;

    // 1. File Size Validation (Max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError(`❌ File "${file.name}" exceeds maximum allowed size of 10MB.`);
      return;
    }

    // 2. MIME Format Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
      setValidationError(`❌ File "${file.name}" is not a supported format (JPG, PNG, WEBP, AVIF).`);
      return;
    }

    setUploading(true);
    setProgress(20);

    // 3. Read Dimensions via HTML5 Image
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const format = file.type.split('/')[1]?.toUpperCase() || 'WEBP';
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspectRatio = `${(width / divisor).toFixed(2)}:${(height / divisor).toFixed(2)}`;

        // Minimum Resolution Check for Desktop Banner (1920 × 700 px)
        if (width < 1920 || height < 700) {
          setValidationError(
            `❌ Banner resolution is too small.\nRequired: 1920 × 700 px minimum.\nYour Image: Width: ${width} px, Height: ${height} px.\nPlease upload a higher resolution banner.`
          );
          setUploading(false);
          setProgress(0);
          return;
        }

        // Set Image Metadata
        setMetadata({
          width,
          height,
          fileSizeMb,
          format,
          aspectRatio,
        });

        setProgress(100);
        setImageUrl(dataUrl);
        setUploading(false);
        setSuccessMsg(`✅ Banner validated & processed! (${width} × ${height} px)`);
      };

      img.onerror = () => {
        setValidationError('❌ Failed to inspect image file dimensions.');
        setUploading(false);
        setProgress(0);
      };
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBannerFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Save Banner to PostgreSQL
  const handleSaveBanner = async () => {
    if (!title.trim()) {
      alert('Banner Title is required.');
      return;
    }
    if (!imageUrl) {
      alert('Please upload a valid banner image before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await createBannerAction({
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: imageUrl,
        link: link.trim(),
        category: category,
        position: banners.length + 1,
        isActive: true,
      });

      if (res.success && res.banner) {
        setBanners((prev) => [...prev, res.banner as any]);
        setShowModal(false);
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setMetadata(null);
      } else {
        alert(res.error || 'Failed to create banner.');
      }
    } catch (err: any) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Banner
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promotional banner from PostgreSQL DB?')) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      await deleteBannerAction(id);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
            PROMOTIONAL MARKETING
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">
            Banner & Hero Sliders
          </h1>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setValidationError(null);
            setSuccessMsg(null);
          }}
          className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Banner Image
        </button>
      </div>

      {/* Recommended Dimensions Spec Card */}
      <div className="p-5 bg-admin-card rounded-2xl border border-admin-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center space-x-3 p-3 bg-admin-bg rounded-xl border border-admin-border">
          <Maximize2 className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-admin-muted uppercase block">Desktop Hero Banner</span>
            <span className="font-mono font-bold text-white text-sm">1920 × 700 px</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-admin-bg rounded-xl border border-admin-border">
          <Maximize2 className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-admin-muted uppercase block">Tablet Carousel</span>
            <span className="font-mono font-bold text-white text-sm">1280 × 500 px</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-admin-bg rounded-xl border border-admin-border">
          <Maximize2 className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-admin-muted uppercase block">Mobile App Banner</span>
            <span className="font-mono font-bold text-white text-sm">800 × 1000 px</span>
          </div>
        </div>
      </div>

      {/* Live Banners Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-admin-muted text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Fetching promotional banners from PostgreSQL DB...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden shadow-xl space-y-4 p-4 hover:border-amber-500/50 transition group"
            >
              <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-admin-bg border border-admin-border">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase tracking-wider shadow-md">
                  {b.category}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-white line-clamp-1">{b.title}</h3>
                <p className="text-xs text-admin-muted line-clamp-1">{b.subtitle || 'Haute Couture Campaign'}</p>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">{b.link}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-admin-border text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  Live on Storefront
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border transition cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-admin-card border border-admin-border p-6 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-admin-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-xl font-bold text-white">Add Promotional Banner</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-admin-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Validation Alert Box */}
            {validationError && (
              <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs whitespace-pre-line space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Validation Error</span>
                </div>
                <p>{validationError}</p>
              </div>
            )}

            {/* Success Message Alert Box */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-admin-border hover:border-amber-500/80 rounded-2xl p-8 text-center bg-[#0B0E14] hover:bg-[#121620] transition cursor-pointer space-y-3 group relative overflow-hidden shadow-inner ${
                uploading ? 'pointer-events-none opacity-80' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                onChange={(e) => e.target.files && handleBannerFileSelect(e.target.files)}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-admin-card border border-admin-border flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition shadow-md">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white text-sm">
                  {uploading ? 'Validating Banner Dimensions...' : '+ Add Banner Image'}
                </p>
                <p className="text-admin-muted text-xs">
                  or <span className="text-amber-400 font-bold underline">Browse Files</span> from gallery or computer
                </p>
              </div>

              <p className="text-[10px] text-amber-400/90 font-mono uppercase tracking-wider">
                Min Required Resolution: 1920 × 700 px (Max 10MB)
              </p>

              {uploading && (
                <div className="w-full max-w-xs mx-auto space-y-1.5 pt-2">
                  <div className="w-full bg-admin-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Banner Live Preview & Metadata Strip */}
            {metadata && imageUrl && (
              <div className="space-y-3 p-4 bg-admin-bg rounded-2xl border border-admin-border">
                <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-admin-border pb-2">
                  <span>LIVE IMAGE PREVIEW & METADATA</span>
                  <span className="font-mono text-emerald-400">PASSED 1920x700 SPEC</span>
                </div>

                <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-black border border-admin-border shadow-lg">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-admin-card rounded-lg border border-admin-border">
                    <span className="text-[9px] text-admin-muted block">Width</span>
                    <span className="font-bold text-white font-mono">{metadata.width} px</span>
                  </div>
                  <div className="p-2 bg-admin-card rounded-lg border border-admin-border">
                    <span className="text-[9px] text-admin-muted block">Height</span>
                    <span className="font-bold text-white font-mono">{metadata.height} px</span>
                  </div>
                  <div className="p-2 bg-admin-card rounded-lg border border-admin-border">
                    <span className="text-[9px] text-admin-muted block">Size</span>
                    <span className="font-bold text-white font-mono">{metadata.fileSizeMb} MB</span>
                  </div>
                  <div className="p-2 bg-admin-card rounded-lg border border-admin-border">
                    <span className="text-[9px] text-admin-muted block">Format</span>
                    <span className="font-bold text-amber-400 font-mono">{metadata.format}</span>
                  </div>
                  <div className="p-2 bg-admin-card rounded-lg border border-admin-border">
                    <span className="text-[9px] text-admin-muted block">Aspect</span>
                    <span className="font-bold text-emerald-400 font-mono">{metadata.aspectRatio}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Banner Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">
                  Banner Campaign Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. THE AUTUMN / WINTER HAUTE COUTURE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discover timeless elegance crafted with Italian silk & cashmeres"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">
                    Banner Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="HERO_SLIDER">HERO SLIDER</option>
                    <option value="OFFER_BANNER">OFFER BANNER</option>
                    <option value="FESTIVAL_BANNER">FESTIVAL BANNER</option>
                    <option value="COLLECTION_BANNER">COLLECTION BANNER</option>
                    <option value="POPUP_BANNER">POPUP BANNER</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-admin-muted uppercase block mb-1">
                    Destination URL Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-admin-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-admin-bg text-admin-muted hover:text-white rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveBanner}
                disabled={saving || uploading || !imageUrl}
                className="px-6 py-2 bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Publish Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
