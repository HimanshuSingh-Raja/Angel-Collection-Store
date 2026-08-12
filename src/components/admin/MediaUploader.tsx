'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface MediaUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

interface CropState {
  imageUrl: string;
  zoom: number; // 1 to 3
  panX: number;
  panY: number;
  rotation: number; // 0, 90, 180, 270
  fitMode: 'cover' | 'fit';
  existingIndex: number;
}

const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1455;

/**
 * Utility to process any image source and render it onto an exact 1080 x 1455 px Canvas
 */
export async function renderTo1080x1455Canvas(
  src: string | File,
  options?: {
    zoom?: number;
    panX?: number;
    panY?: number;
    rotation?: number;
    fitMode?: 'cover' | 'fit';
  }
): Promise<string> {
  const { zoom = 1, panX = 0, panY = 0, rotation = 0, fitMode = 'cover' } = options || {};

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const loadSource = (url: string) => {
      img.src = url;
    };

    if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => loadSource(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(src);
    } else {
      loadSource(src);
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Configure high-quality smoothing & anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill canvas background
      ctx.fillStyle = '#0B0E14';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      const srcW = img.width;
      const srcH = img.height;

      // Handle orientation swap for 90 / 270 deg rotation
      const isRotated = rotation === 90 || rotation === 270;
      const effectiveW = isRotated ? srcH : srcW;
      const effectiveH = isRotated ? srcW : srcH;

      let baseScale = 1;
      if (fitMode === 'cover') {
        baseScale = Math.max(TARGET_WIDTH / effectiveW, TARGET_HEIGHT / effectiveH);
      } else {
        baseScale = Math.min(TARGET_WIDTH / effectiveW, TARGET_HEIGHT / effectiveH);
      }

      const scale = baseScale * zoom;
      const drawW = srcW * scale;
      const drawH = srcH * scale;

      ctx.save();
      ctx.translate(TARGET_WIDTH / 2 + panX, TARGET_HEIGHT / 2 + panY);

      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      // Draw soft blurred background if fitMode === 'fit'
      if (fitMode === 'fit') {
        ctx.save();
        ctx.filter = 'blur(30px) brightness(0.4)';
        const bgScale = Math.max(TARGET_WIDTH / srcW, TARGET_HEIGHT / srcH) * 1.2;
        ctx.drawImage(img, (-srcW * bgScale) / 2, (-srcH * bgScale) / 2, srcW * bgScale, srcH * bgScale);
        ctx.restore();
      }

      // Draw primary product image centered
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Export as high quality JPEG (0.92)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for 1080x1455 canvas output'));
    };
  });
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  onChange,
  maxFiles = 20,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active crop state for fine-tuning positioning
  const [activeCrop, setActiveCrop] = useState<CropState | null>(null);

  // Dragging state inside cropper modal
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Handle image files selection / drag-and-drop
  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    setSuccessMsg(null);

    if (images.length >= maxFiles) {
      setError(`Maximum limit of ${maxFiles} images per product reached.`);
      return;
    }

    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

    Array.from(files).forEach((file) => {
      if (file.size > 12 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds maximum allowed size of 12MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        setError(`File "${file.name}" is not a supported image format (JPG, PNG, WEBP, AVIF).`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    const filesToProcess = validFiles.slice(0, remainingSlots);

    setUploading(true);
    setProgress(10);

    try {
      const processedUrls: string[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        // Automatically crop & resize image to exact 1080 x 1455 px canvas
        const croppedDataUrl = await renderTo1080x1455Canvas(file, { fitMode: 'cover' });
        processedUrls.push(croppedDataUrl);

        const currentProg = Math.round(((i + 1) / filesToProcess.length) * 100);
        setProgress(currentProg);
      }

      const combined = [...images, ...processedUrls].slice(0, maxFiles);
      onChange(combined);
      setSuccessMsg(`Successfully uploaded & processed ${processedUrls.length} image(s) to 1080 × 1455 px!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Upload & crop error:', err);
      setError('Failed to process image to 1080 × 1455 px ratio.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Open cropper modal for an existing gallery image
  const openReCrop = (index: number) => {
    const url = images[index];
    if (!url) return;
    setActiveCrop({
      imageUrl: url,
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      fitMode: 'cover',
      existingIndex: index,
    });
  };

  // Save manual crop adjustments
  const saveCurrentCrop = async () => {
    if (!activeCrop) return;

    setUploading(true);
    try {
      const croppedDataUrl = await renderTo1080x1455Canvas(activeCrop.imageUrl, {
        zoom: activeCrop.zoom,
        panX: activeCrop.panX,
        panY: activeCrop.panY,
        rotation: activeCrop.rotation,
        fitMode: activeCrop.fitMode,
      });

      const updated = [...images];
      updated[activeCrop.existingIndex] = croppedDataUrl;
      onChange(updated);
      setSuccessMsg(`Image #${activeCrop.existingIndex + 1} updated to 1080 × 1455 px!`);
      setActiveCrop(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Crop save error:', err);
      setError('Failed to save 1080 × 1455 px framing adjustment.');
    } finally {
      setUploading(false);
    }
  };

  // Dragging handlers for cropping viewport
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeCrop) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: activeCrop.panX,
      initialPanY: activeCrop.panY,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !activeCrop) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setActiveCrop((prev) =>
      prev
        ? {
            ...prev,
            panX: dragStartRef.current.initialPanX + deltaX * 1.5,
            panY: dragStartRef.current.initialPanY + deltaY * 1.5,
          }
        : null
    );
  }, [isDragging, activeCrop]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    if (confirm('Delete this image from gallery?')) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Notifications */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 font-bold">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2">
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
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
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
            {uploading ? 'Processing to 1080 × 1455 PX...' : '📷 Drag & Drop Product Images (Fixed 1080 × 1455 PX)'}
          </p>
          <p className="text-admin-muted text-xs">
            or <span className="text-amber-400 font-bold underline">Browse Files</span> — Automatically cropped & centered
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" /> ENFORCED RATIO: 1080 × 1455 PX (0.7423)
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full max-w-xs mx-auto space-y-1.5 pt-2">
            <div className="w-full bg-admin-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-amber-400">
              <span>Processing to 1080 × 1455 PX...</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Image Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-admin-muted text-[11px]">
            <span className="font-bold text-white">Product Gallery ({images.length} / {maxFiles} images)</span>
            <span className="font-mono text-amber-400 font-bold">All Images: Fixed 1080 × 1455 PX</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div
                key={idx}
                className={`relative aspect-[1080/1455] rounded-xl overflow-hidden border-2 bg-admin-bg group shadow-lg ${
                  idx === 0 ? 'border-amber-400' : 'border-admin-border'
                }`}
              >
                <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />

                {/* Primary Cover Badge */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase tracking-wider shadow-md">
                    COVER
                  </span>
                )}

                {/* Resolution Badge */}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-amber-300 font-mono font-bold text-[8px] border border-amber-500/30 backdrop-blur-md">
                  1080 × 1455 PX
                </span>

                {/* Hover Controls */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2.5">
                  <div className="flex justify-between items-center">
                    {idx !== 0 ? (
                      <button
                        type="button"
                        onClick={() => setCoverImage(idx)}
                        className="px-2 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow"
                        title="Set Cover Image"
                      >
                        <Star className="w-3 h-3 fill-neutral-950" /> Cover
                      </button>
                    ) : <span />}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openReCrop(idx)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 transition border border-amber-500/40 cursor-pointer shadow"
                        title="Crop / Re-align Framing (1080×1455)"
                      >
                        <Crop className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white transition hover:bg-rose-500 cursor-pointer shadow"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Reorder Shift Buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'left')}
                      className="p-1 rounded bg-black/80 text-white disabled:opacity-20 cursor-pointer hover:bg-amber-600 transition"
                      title="Shift Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-neutral-400">#{idx + 1}</span>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'right')}
                      className="p-1 rounded bg-black/80 text-white disabled:opacity-20 cursor-pointer hover:bg-amber-600 transition"
                      title="Shift Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CROP & FRAMING ADJUSTMENT MODAL (1080 × 1455 PX) */}
      {/* ============================================================ */}
      {activeCrop && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="max-w-2xl w-full bg-[#121620] border border-[#202736] rounded-3xl p-6 shadow-2xl space-y-5 my-auto text-white">
            <div className="flex items-center justify-between pb-4 border-b border-[#202736]">
              <div>
                <div className="flex items-center gap-2">
                  <Crop className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-bold text-lg text-white">
                    Adjust Product Framing (1080 × 1455 PX)
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Drag image to center product inside the 1080 × 1455 frame.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCrop(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Viewport locked to 1080:1455 Aspect Ratio */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full max-w-[280px] sm:max-w-[320px] shrink-0 mx-auto">
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`relative w-full aspect-[1080/1455] rounded-2xl overflow-hidden bg-black border-2 border-amber-500 shadow-2xl select-none cursor-grab active:cursor-grabbing ${
                    isDragging ? 'cursor-grabbing' : ''
                  }`}
                >
                  <img
                    src={activeCrop.imageUrl}
                    alt="Crop preview"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `translate(${activeCrop.panX / 4}px, ${activeCrop.panY / 4}px) scale(${activeCrop.zoom}) rotate(${activeCrop.rotation}deg)`,
                      objectFit: activeCrop.fitMode === 'cover' ? 'cover' : 'contain',
                    }}
                  />

                  {/* Rule of Thirds Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-amber-400/40">
                    <div className="border-r border-b border-amber-400/40" />
                    <div className="border-r border-b border-amber-400/40" />
                    <div className="border-b border-amber-400/40" />
                    <div className="border-r border-b border-amber-400/40" />
                    <div className="border-r border-b border-amber-400/40" />
                    <div className="border-b border-amber-400/40" />
                    <div className="border-r border-amber-400/40" />
                    <div className="border-r border-amber-400/40" />
                    <div />
                  </div>

                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 text-amber-400 font-mono font-bold text-[10px] border border-amber-500/30 backdrop-blur-md">
                    1080 × 1455 PX
                  </span>
                </div>
                <p className="text-[10px] text-center text-neutral-400 mt-2 font-mono">
                  💡 Drag image to center product inside frame
                </p>
              </div>

              {/* Adjustment Controls */}
              <div className="flex-1 space-y-5 w-full">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Cropping Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCrop((prev) => (prev ? { ...prev, fitMode: 'cover', panX: 0, panY: 0, zoom: 1 } : null))}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        activeCrop.fitMode === 'cover'
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                          : 'bg-admin-bg text-neutral-300 border-admin-border hover:bg-admin-card'
                      }`}
                    >
                      <Maximize className="w-4 h-4" />
                      <span>Center Cover</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCrop((prev) => (prev ? { ...prev, fitMode: 'fit', panX: 0, panY: 0, zoom: 1 } : null))}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        activeCrop.fitMode === 'fit'
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                          : 'bg-admin-bg text-neutral-300 border-admin-border hover:bg-admin-card'
                      }`}
                    >
                      <Minimize className="w-4 h-4" />
                      <span>Fit Full Photo</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-300 uppercase">Zoom Scale</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(activeCrop.zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-neutral-400" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={activeCrop.zoom}
                      onChange={(e) =>
                        setActiveCrop((prev) => (prev ? { ...prev, zoom: parseFloat(e.target.value) } : null))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#202736]">
                  <span className="text-xs font-bold text-neutral-300 uppercase">Rotation</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCrop((prev) => (prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null))
                    }
                    className="px-3 py-2 rounded-xl bg-admin-card hover:bg-neutral-800 border border-admin-border text-xs font-bold flex items-center gap-2 cursor-pointer transition text-white"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rotate ({activeCrop.rotation}°)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202736]">
              <button
                type="button"
                onClick={() => setActiveCrop(null)}
                className="px-4 py-3 rounded-xl bg-admin-card text-neutral-300 hover:text-white border border-admin-border text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveCurrentCrop}
                disabled={uploading}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Saving 1080×1455...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Image (1080 × 1455 PX)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
