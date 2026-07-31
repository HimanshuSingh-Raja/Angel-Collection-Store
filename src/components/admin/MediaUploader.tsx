'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Star, Trash2, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface MediaUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
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

  // Compress image to optimized Data URL if over size limit
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.88 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => {
          resolve(e.target?.result as string);
        };
      };
    });
  };

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
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds maximum allowed size of 10MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        setError(`File "${file.name}" is not a supported image format (JPG, PNG, WEBP, AVIF).`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(10);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const compressedDataUrl = await compressImage(file);
        uploadedUrls.push(compressedDataUrl);

        const currentProg = Math.round(((i + 1) / validFiles.length) * 90);
        setProgress(currentProg);
      }

      setProgress(100);
      const combined = [...images, ...uploadedUrls].slice(0, maxFiles);
      onChange(combined);
      setSuccessMsg(`Successfully uploaded & optimized ${validFiles.length} image(s)!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process image files.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
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
            {uploading ? 'Optimizing & Uploading Media...' : '📷 Drag & Drop Images Here'}
          </p>
          <p className="text-admin-muted text-xs">
            or <span className="text-amber-400 font-bold underline">Browse Files</span> from your computer or mobile gallery
          </p>
        </div>

        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
          Supports JPG, PNG, WEBP, AVIF (Max 10MB each | Up to 20 images)
        </p>

        {/* Upload Progress Indicator */}
        {uploading && (
          <div className="w-full max-w-xs mx-auto space-y-1.5 pt-2">
            <div className="w-full bg-admin-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-amber-400">
              <span>Uploading & Optimizing...</span>
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
            <span>⭐ First image is primary cover photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div
                key={idx}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-admin-bg group shadow-lg ${
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

                {/* Hover Controls */}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
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

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white transition hover:bg-rose-500 cursor-pointer shadow"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
    </div>
  );
};
