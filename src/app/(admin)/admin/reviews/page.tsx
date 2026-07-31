'use client';

import React, { useState } from 'react';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { INITIAL_REVIEWS } from '@/lib/mock-data';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const handleStatusChange = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">CLIENT MODERATION</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Review Management</h1>
        </div>
      </div>

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
                    <img src={r.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-white">{r.userName}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-white">{r.title}</p>
                    <p className="text-admin-muted text-[11px] line-clamp-1">{r.comment}</p>
                  </td>
                  <td className="py-4 px-4 text-admin-muted">{formatDate(r.createdAt)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleStatusChange(r.id, 'APPROVED')}
                      className="p-1.5 rounded-lg bg-admin-bg hover:bg-emerald-500/20 text-emerald-400 border border-admin-border transition"
                      title="Approve Review"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(r.id, 'REJECTED')}
                      className="p-1.5 rounded-lg bg-admin-bg hover:bg-rose-500/20 text-rose-400 border border-admin-border transition"
                      title="Reject Review"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg bg-admin-bg hover:bg-neutral-800 text-admin-muted border border-admin-border transition"
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
    </div>
  );
}
