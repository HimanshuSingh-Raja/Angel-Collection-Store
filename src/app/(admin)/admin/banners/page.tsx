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
  Maximize2,
  X,
  Sparkles,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { INITIAL_BANNERS } from '@/lib/mock-data';
import { Banner } from '@/types';
import {
  getAdminBannersAction,
  createBannerAction,
  deleteBannerAction,
  updateBannerAction,
} from '@/actions/banner-admin';
import {
  subscribeAdminBanners,
  saveFirestoreBanner,
  deleteFirestoreBanner,
} from '@/lib/firebase/banners';

interface BannerMetadata {
  width: number;
  height: number;
  fileSizeMb: string;
  format: string;
  aspectRatio: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pagination State (5 banners per page)
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State (Add or Edit Mode)
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('/shop?category=women');
  const [category, setCategory] = useState<
    'HERO_SLIDER' | 'OFFER_BANNER' | 'FESTIVAL_BANNER' | 'COLLECTION_BANNER' | 'POPUP_BANNER'
  >('HERO_SLIDER');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Image Metadata & Validation
  const [metadata, setMetadata] = useState<BannerMetadata | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time Firestore banner collection on mount
  useEffect(() => {
    setLoading(true);
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      unsubscribeFirestore = subscribeAdminBanners((liveBanners) => {
        if (liveBanners && liveBanners.length > 0) {
          setBanners(liveBanners);
        } else {
          setBanners(INITIAL_BANNERS);
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn('Firestore real-time subscription error, fallback to server action:', err);
    }

    // Server action fallback
    async function loadFallback() {
      try {
        const liveBanners = await getAdminBannersAction();
        if (liveBanners && liveBanners.length > 0) {
          setBanners(liveBanners as any);
        }
      } catch (e) {
        // Fallback to initial
      } finally {
        setLoading(false);
      }
    }
    loadFallback();

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Calculate pagination boundaries
  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBanners = banners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset pagination if current page becomes out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [banners.length, totalPages, currentPage]);

  // Open Modal in Create Mode
  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setLink('/shop?category=women');
    setCategory('HERO_SLIDER');
    setImageUrl('');
    setIsActive(true);
    setMetadata(null);
    setValidationError(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  // Open Modal in Edit Mode
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setLink(banner.link || '/shop?category=women');
    setCategory(banner.category || 'HERO_SLIDER');
    setImageUrl(banner.imageUrl || '');
    setIsActive(banner.isActive ?? true);
    setMetadata(null);
    setValidationError(null);
    setSuccessMsg(null);

    if (banner.imageUrl) {
      const img = new Image();
      img.src = banner.imageUrl;
      img.onload = () => {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.width, img.height);
        setMetadata({
          width: img.width,
          height: img.height,
          fileSizeMb: '0.85',
          format: 'WEBP',
          aspectRatio: `${(img.width / divisor).toFixed(2)}:${(img.height / divisor).toFixed(2)}`,
        });
      };
    }

    setShowModal(true);
  };

  // Handle Image Selection & Dimensions Check
  const handleBannerFileSelect = async (files: FileList | File[]) => {
    setValidationError(null);
    setSuccessMsg(null);

    const file = files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setValidationError(`❌ File "${file.name}" exceeds maximum allowed size of 10MB.`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
      setValidationError(`❌ File "${file.name}" is not a supported format (JPG, PNG, WEBP, AVIF).`);
      return;
    }

    setUploading(true);
    setProgress(20);

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

        if (width < 1920 || height < 700) {
          setValidationError(
            `❌ Banner resolution is too small.\nRequired: 1920 × 700 px minimum.\nYour Image: Width: ${width} px, Height: ${height} px.\nPlease upload a higher resolution banner.`
          );
          setUploading(false);
          setProgress(0);
          return;
        }

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

  // Real-time Save / Update Banner to Firestore & Database
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
      if (editingBanner) {
        // UPDATE EXISTING BANNER
        await saveFirestoreBanner({
          id: editingBanner.id,
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl: imageUrl,
          link: link.trim(),
          category: category,
          isActive: isActive,
        });

        await updateBannerAction(editingBanner.id, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl: imageUrl,
          link: link.trim(),
          category: category,
          isActive: isActive,
        });

        setSuccessMsg('✅ Banner updated & synced to storefront in real-time!');
        setTimeout(() => {
          setShowModal(false);
          setEditingBanner(null);
        }, 600);
      } else {
        // CREATE NEW BANNER
        const newDocId = `banner_${Date.now()}`;
        await saveFirestoreBanner({
          id: newDocId,
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl: imageUrl,
          link: link.trim(),
          category: category,
          position: banners.length + 1,
          isActive: isActive,
        });

        await createBannerAction({
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl: imageUrl,
          link: link.trim(),
          category: category,
          position: banners.length + 1,
          isActive: isActive,
        });

        setSuccessMsg('✅ Banner published & synced to storefront in real-time!');
        setTimeout(() => {
          setShowModal(false);
        }, 600);
      }
    } catch (err: any) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner changes.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Active Status in Real-Time
  const handleToggleActive = async (banner: Banner) => {
    const nextActive = !banner.isActive;
    try {
      await saveFirestoreBanner({
        id: banner.id,
        isActive: nextActive,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        link: banner.link,
        category: banner.category,
      });
      await updateBannerAction(banner.id, { isActive: nextActive });
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  // Real-Time Delete Banner
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner in real-time?')) {
      try {
        await deleteFirestoreBanner(id);
        await deleteBannerAction(id);
      } catch (err) {
        console.error('Failed to delete banner:', err);
      }
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
              PROMOTIONAL MARKETING
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/20">
              5 BANNERS PER PAGE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> FIRESTORE REALTIME SYNC
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">
            Banner & Hero Sliders
          </h1>
        </div>

        <button
          onClick={openCreateModal}
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

      {/* Management Toolbar & Count Bar */}
      <div className="flex items-center justify-between text-xs text-admin-muted px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Active Banners Gallery</span>
          <span className="text-amber-400 font-mono">
            (Showing {banners.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, banners.length)} of {banners.length})
          </span>
        </div>

        {totalPages > 1 && (
          <span className="font-mono text-neutral-400">
            Page <strong className="text-white">{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Live Banners Grid (Max 5 at a time) */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-admin-muted text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Listening to Firestore real-time banner collection...</span>
        </div>
      ) : paginatedBanners.length === 0 ? (
        <div className="p-12 text-center bg-admin-card rounded-2xl border border-admin-border space-y-3">
          <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
          <p className="text-white font-bold text-sm">No promotional banners found</p>
          <p className="text-admin-muted text-xs max-w-sm mx-auto">
            Click "+ Add Banner Image" to publish your first high-resolution hero campaign.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
          >
            + Add First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBanners.map((b) => (
            <div
              key={b.id}
              className={`bg-admin-card rounded-2xl border overflow-hidden shadow-xl space-y-4 p-4 transition group ${
                b.isActive ? 'border-admin-border hover:border-amber-500/50' : 'border-rose-900/40 opacity-75'
              }`}
            >
              <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-admin-bg border border-admin-border">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase tracking-wider shadow-md">
                  {b.category}
                </span>

                {!b.isActive && (
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider shadow-md">
                    PAUSED
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-white line-clamp-1">{b.title}</h3>
                <p className="text-xs text-admin-muted line-clamp-1">{b.subtitle || 'Haute Couture Campaign'}</p>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1 truncate">{b.link}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-admin-border text-xs">
                {/* Active / Inactive Status Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(b)}
                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] border flex items-center gap-1.5 transition cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                  }`}
                  title="Toggle Storefront Visibility"
                >
                  {b.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{b.isActive ? 'Live on Storefront' : 'Hidden from Store'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Edit Banner Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/30 transition cursor-pointer shadow"
                    title="Edit Banner Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Banner Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (5 Banners per Page) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-admin-border text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-admin-card text-white rounded-xl border border-admin-border font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'bg-admin-card text-neutral-400 hover:text-white border border-admin-border'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-admin-card text-white rounded-xl border border-admin-border font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-admin-card border border-admin-border p-6 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative my-8 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-admin-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {editingBanner ? 'Edit Promotional Banner' : 'Add Promotional Banner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingBanner(null);
                }}
                className="p-1.5 rounded-lg text-admin-muted hover:text-white hover:bg-neutral-800 transition"
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
                  {uploading
                    ? 'Validating Banner Dimensions...'
                    : editingBanner
                    ? '📷 Change Banner Image'
                    : '+ Add Banner Image'}
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
            {imageUrl && (
              <div className="space-y-3 p-4 bg-admin-bg rounded-2xl border border-admin-border">
                <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-admin-border pb-2">
                  <span>LIVE IMAGE PREVIEW</span>
                  <span className="font-mono text-emerald-400">STOREFRONT RESOLUTION SPEC</span>
                </div>

                <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-black border border-admin-border shadow-lg">
                  <img src={imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                </div>

                {metadata && (
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
                )}
              </div>
            )}

            {/* Form Input Fields */}
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
                    className="w-full px-3 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
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

              {/* Storefront Active Status Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">
                    Publish Live on Storefront immediately
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-admin-border">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingBanner(null);
                }}
                className="px-4 py-2.5 bg-admin-bg text-admin-muted hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={saving || uploading || !imageUrl}
                className="px-6 py-2.5 bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Saving Real-Time...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>{editingBanner ? 'Update Banner / Save Changes' : 'Publish Banner'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
