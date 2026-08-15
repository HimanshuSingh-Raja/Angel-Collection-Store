'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getAdminReviewsAction, updateReviewStatusAction, deleteReviewAction } from '@/actions/review-admin';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReview, setDeletingReview] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const liveReviews = await getAdminReviewsAction();
        setReviews(liveReviews);
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await updateReviewStatusAction(id, status);
    setActionLoadingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    const targetId = deletingReview.id;
    setActionLoadingId(targetId);
    setReviews((prev) => prev.filter((r) => r.id !== targetId));
    await deleteReviewAction(targetId);
    setDeletingReview(null);
    setActionLoadingId(null);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">CLIENT MODERATION</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Review Management</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-admin-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Fetching client reviews...</span>
        </div>
      ) : (
        <div className="bg-admin-card rounded-2xl border border-admin-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border uppercase font-bold text-admin-muted bg-admin-bg">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Comment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border text-admin-text">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-admin-hover transition">
                    <td className="py-4 px-4 flex items-center space-x-3">
                      <img
                        src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-admin-border"
                      />
                      <span className="font-bold text-white">{r.userName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex text-amber-400">
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-white">{r.title || r.product?.title || 'Product Review'}</p>
                      <p className="text-admin-muted text-[11px] line-clamp-1">{r.comment}</p>
                    </td>
                    <td className="py-4 px-4 text-admin-muted">{formatDate(r.createdAt)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleStatusChange(r.id, 'APPROVED')}
                        disabled={actionLoadingId === r.id}
                        className="p-1.5 rounded-lg bg-admin-bg hover:bg-emerald-500/20 text-emerald-400 border border-admin-border transition cursor-pointer"
                        title="Approve Review"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(r.id, 'REJECTED')}
                        disabled={actionLoadingId === r.id}
                        className="p-1.5 rounded-lg bg-admin-bg hover:bg-rose-500/20 text-rose-400 border border-admin-border transition cursor-pointer"
                        title="Reject Review"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingReview(r)}
                        disabled={actionLoadingId === r.id}
                        className="p-1.5 rounded-lg bg-admin-bg hover:bg-neutral-800 text-admin-muted hover:text-rose-400 border border-admin-border transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white">Confirm Review Deletion</h3>
            </div>

            <p className="text-admin-muted leading-relaxed">
              Are you sure you want to delete the review by <strong className="text-white">"{deletingReview.userName}"</strong>?
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-admin-border">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
