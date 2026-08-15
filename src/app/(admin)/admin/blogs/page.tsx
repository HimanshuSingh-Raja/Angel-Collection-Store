'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Loader2, CheckCircle2, AlertCircle, X, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  getAdminBlogsAction,
  createBlogAction,
  updateBlogAction,
  deleteBlogAction,
} from '@/actions/blog-admin';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState<Blog | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Haute Couture');
  const [coverImage, setCoverImage] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load posts on mount
  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const liveBlogs = await getAdminBlogsAction();
        setBlogs(liveBlogs as Blog[]);
      } catch (err) {
        console.error('Failed to load blogs:', err);
        setErrorMessage('Failed to load blog posts from database.');
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Haute Couture');
    setCoverImage('');
    setReadTime('5 min read');
    setTags('');
    setIsPublished(true);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open Edit Modal with prefilled data
  const handleOpenEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content || '');
    setCategory(blog.category || 'Haute Couture');
    setCoverImage(blog.coverImage || '');
    setReadTime(blog.readTime || '5 min read');
    setTags(blog.tags || '');
    setIsPublished(blog.isPublished ?? true);
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingBlog(null);
    resetForm();
  };

  // Handle Create Post Submit
  const handleCreateBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await createBlogAction({
        title,
        excerpt,
        content: content || excerpt,
        category,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200',
        readTime,
        tags,
        isPublished,
      });

      if (res.success && res.blog) {
        setBlogs([res.blog as Blog, ...blogs]);
        setShowCreateModal(false);
        resetForm();
        setSuccessMessage('Blog article created and published successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to create blog post.');
      }
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Post Submit (Updates existing DB record by ID, no duplicate created)
  const handleUpdateBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !title.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await updateBlogAction(editingBlog.id, {
        title,
        excerpt,
        content: content || excerpt,
        category,
        coverImage: coverImage || editingBlog.coverImage,
        readTime,
        tags,
        isPublished,
      });

      if (res.success && res.blog) {
        setBlogs((prev) => prev.map((b) => (b.id === editingBlog.id ? (res.blog as Blog) : b)));
        setEditingBlog(null);
        resetForm();
        setSuccessMessage('Existing blog post updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to update blog post.');
      }
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Post Confirmation Execution
  const handleConfirmDelete = async () => {
    if (!deleteConfirmBlog) return;

    const targetId = deleteConfirmBlog.id;
    setDeletingId(targetId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await deleteBlogAction(targetId);
      if (res.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== targetId));
        setDeleteConfirmBlog(null);
        setSuccessMessage('Blog post deleted from database successfully.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to delete blog post.');
      }
    } catch (err: any) {
      console.error('Error deleting blog post:', err);
      setErrorMessage(err.message || 'An error occurred during deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
            CONTENT EDITORIAL MANAGEMENT
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Blog Editorial Posts</h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Blog Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-admin-muted text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading blog articles from PostgreSQL database...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center bg-admin-card rounded-2xl border border-admin-border space-y-3">
          <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">No Blog Posts Found</h3>
          <p className="text-xs text-admin-muted">Click "Create Blog Post" to publish your first article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((b) => (
            <div key={b.id} className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={b.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300'}
                    alt={b.title}
                    className="w-24 h-24 object-cover rounded-xl border border-admin-border shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{b.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${b.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-400'}`}>
                        {b.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white line-clamp-1">{b.title}</h3>
                    <p className="text-xs text-admin-muted line-clamp-2">{b.excerpt}</p>
                    <span className="text-[10px] text-admin-muted block pt-1">
                      {formatDate(b.publishedAt)} • {b.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-admin-border">
                <Link
                  href={`/blog/${b.slug}`}
                  target="_blank"
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview Post
                </Link>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-amber-400 border border-admin-border transition cursor-pointer flex items-center gap-1 text-xs font-bold px-3"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => setDeleteConfirmBlog(b)}
                    className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border transition cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE BLOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBlogSubmit} className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-lg w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Create & Publish Blog Post</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-admin-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Silk Draping Techniques for Milan Fashion Week 2026"
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-admin-muted block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Haute Couture"
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                />
              </div>

              <div>
                <label className="font-bold text-admin-muted block mb-1">Estimated Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Excerpt *</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary displayed on blog list cards..."
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Full Content</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detailed article body paragraphs..."
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-admin-border">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">Publish Immediately</span>
              </label>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Article</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* EDIT BLOG MODAL (Updates existing DB record by ID, no duplicate created) */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateBlogSubmit} className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-lg w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-300">Edit Existing Post</h3>
              <button type="button" onClick={handleCancelEdit} className="text-admin-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-admin-muted block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                />
              </div>

              <div>
                <label className="font-bold text-admin-muted block mb-1">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Article Excerpt *</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-admin-muted block mb-1">Full Article Body</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-admin-border">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-admin-border text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-white">Status: Published</span>
              </label>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl cursor-pointer hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer hover:bg-amber-400 transition"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white">Confirm Post Deletion</h3>
            </div>

            <p className="text-admin-muted leading-relaxed">
              Are you sure you want to delete the blog post <strong className="text-white">"{deleteConfirmBlog.title}"</strong>?
              This action will permanently remove the record from the database and UI.
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-admin-border">
              <button
                type="button"
                onClick={() => setDeleteConfirmBlog(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                {deletingId !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
