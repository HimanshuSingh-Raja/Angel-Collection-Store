'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { getAdminCategoriesAction, createCategoryAction, deleteCategoryAction } from '@/actions/category-admin';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const liveCats = await getAdminCategoriesAction();
        setCategories(liveCats);
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await createCategoryAction({ name, slug });
      if (res.success && res.category) {
        setCategories([
          {
            id: res.category.id,
            name: res.category.name,
            slug: res.category.slug,
            image: res.category.image,
            description: res.category.description,
            isFeatured: res.category.isFeatured,
            productCount: 0,
          },
          ...categories,
        ]);
        setName('');
        setSlug('');
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category from PostgreSQL DB?')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      await deleteCategoryAction(id);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">CATALOGUE HIERARCHY</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Category Management</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-admin-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Fetching live categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg flex gap-4 items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img src={cat.image} alt="" className="w-16 h-20 object-cover rounded-xl border border-admin-border" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{cat.name}</h3>
                  <span className="text-[10px] font-mono text-amber-400">/{cat.slug}</span>
                  <p className="text-xs text-admin-muted line-clamp-1 mt-1">{cat.description}</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    {cat.productCount} Associated Products
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCategory} className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-md w-full space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-white">Create Category</h3>
            <div>
              <label className="font-bold text-admin-muted block mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-bold text-admin-muted block mb-1">SEO Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-amber-400 font-mono rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
