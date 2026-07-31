'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, BookOpen } from 'lucide-react';
import { INITIAL_BLOGS } from '@/lib/mock-data';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const created: Blog = {
      id: `blog-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      excerpt: excerpt || 'Exclusive haute couture trends and craftsmanship guide.',
      content: 'Haute couture article content...',
      coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200',
      authorName: 'Angel Editorial',
      category: 'Haute Couture',
      readTime: '5 min read',
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
    setBlogs([...blogs, created]);
    setTitle('');
    setExcerpt('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">CONTENT MANAGEMENT</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Blog Editorial Management</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((b) => (
          <div key={b.id} className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <img src={b.coverImage} alt="" className="w-20 h-20 object-cover rounded-xl border border-admin-border" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{b.category}</span>
                <h3 className="font-serif text-lg font-bold text-white line-clamp-1">{b.title}</h3>
                <p className="text-xs text-admin-muted line-clamp-1 mt-1">{b.excerpt}</p>
                <span className="text-[10px] text-admin-muted block mt-1">{formatDate(b.publishedAt)} • {b.readTime}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-admin-border">
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBlog} className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-md w-full space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-white">Create Blog Article</h3>
            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
              />
            </div>
            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Excerpt</label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl">
                Publish Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
