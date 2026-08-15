'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, User, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getBlogBySlugAction } from '@/actions/blog-admin';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; userName: string; comment: string; date: string }>>([
    { id: '1', userName: 'Victoria Sterling', comment: 'Insightful guide! Understanding Mulberry silk drape helped me pick the right gown.', date: 'July 22, 2026' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadBlog() {
      setLoading(true);
      try {
        const fetchedBlog = await getBlogBySlugAction(slug);
        setBlog(fetchedBlog);
        if (fetchedBlog && fetchedBlog.comments && fetchedBlog.comments.length > 0) {
          setCommentsList(
            fetchedBlog.comments.map((c: any) => ({
              id: c.id,
              userName: c.userName,
              comment: c.comment,
              date: formatDate(c.createdAt),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load blog by slug:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentsList([
      ...commentsList,
      { id: Date.now().toString(), userName: commentName || 'Anonymous VIP', comment: commentText, date: 'Just now' },
    ]);

    setCommentText('');
    setCommentName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-500 text-xs gap-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
        <span>Loading article...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Article Not Found</h2>
        <p className="text-xs text-neutral-500">The requested blog post could not be located.</p>
        <Link href="/blog" className="inline-block px-5 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/blog" className="text-xs font-bold text-neutral-600 hover:text-black flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </Link>

      <div className="space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">{blog.category}</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center space-x-6 text-xs text-neutral-500 pt-2 border-b border-neutral-200 pb-4">
          <div className="flex items-center space-x-2">
            {blog.authorAvatar && <img src={blog.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />}
            <span className="font-bold text-neutral-900">{blog.authorName}</span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> {blog.readTime}
          </span>
          <span>{formatDate(blog.publishedAt)}</span>
        </div>
      </div>

      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl bg-neutral-900 border border-neutral-200">
        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed font-light space-y-4">
        {(blog.content || blog.excerpt || '').split('\n\n').map((paragraph: string, i: number) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Comments Section */}
      <div className="pt-12 border-t border-neutral-200 space-y-8">
        <h3 className="font-serif text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-700" />
          <span>Client Comments ({commentsList.length})</span>
        </h3>

        <div className="space-y-4">
          {commentsList.map((c) => (
            <div key={c.id} className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-900">{c.userName}</span>
                <span className="text-[10px] text-neutral-400">{c.date}</span>
              </div>
              <p className="text-neutral-600 font-light">{c.comment}</p>
            </div>
          ))}
        </div>

        {/* Comment Form */}
        <form onSubmit={handlePostComment} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4 text-xs">
          <h4 className="font-serif text-lg font-bold text-neutral-900">Leave A Reply</h4>

          {submitted && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your comment has been posted.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
            />
          </div>

          <textarea
            rows={3}
            required
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 font-sans"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-neutral-950 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-amber-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>Submit Comment</span>
          </button>
        </form>
      </div>
    </div>
  );
}
