'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, User, Loader2, BookOpen } from 'lucide-react';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';
import { getStorefrontBlogsAction } from '@/actions/blog-admin';

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const liveBlogs = await getStorefrontBlogsAction();
        setBlogs(liveBlogs as Blog[]);
      } catch (err) {
        console.error('Failed to fetch storefront blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700">HAUTE EDITORIAL</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900">
          The Angel Journal
        </h1>
        <p className="text-xs text-neutral-500">
          Insights into Milanese silk draping, GIA diamond clarity, bespoke menswear, and international haute couture.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-neutral-500 text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
          <span>Loading editorial articles...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-8 h-8 text-amber-700 mx-auto" />
          <p className="text-xs text-neutral-500">No blog posts available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-700" /> {post.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" /> {post.readTime}
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 group-hover:text-amber-800 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-950 group-hover:text-amber-800 pt-2"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
