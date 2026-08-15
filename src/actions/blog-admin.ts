'use server';

import { revalidatePath } from 'next/cache';
import { db as prisma } from '@/lib/db';
import { INITIAL_BLOGS } from '@/lib/mock-data';

export interface CreateBlogInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorName?: string;
  authorAvatar?: string;
  category?: string;
  tags?: string;
  readTime?: string;
  isPublished?: boolean;
}

export interface UpdateBlogInput {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  authorName?: string;
  authorAvatar?: string;
  category?: string;
  tags?: string;
  readTime?: string;
  isPublished?: boolean;
}

/**
 * Fetch all blog posts for Admin management.
 * Seeds initial blog posts into Postgres DB if empty.
 */
export async function getAdminBlogsAction() {
  try {
    const count = await prisma.blog.count();
    if (count === 0 && INITIAL_BLOGS.length > 0) {
      for (const b of INITIAL_BLOGS) {
        await prisma.blog.create({
          data: {
            id: b.id,
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            content: b.content,
            coverImage: b.coverImage,
            authorName: b.authorName,
            authorAvatar: b.authorAvatar || null,
            category: b.category,
            tags: b.tags || null,
            readTime: b.readTime,
            isPublished: b.isPublished ?? true,
            publishedAt: new Date(b.publishedAt),
          },
        }).catch(() => {});
      }
    }

    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage,
      authorName: b.authorName,
      authorAvatar: b.authorAvatar || undefined,
      category: b.category,
      tags: b.tags || undefined,
      readTime: b.readTime,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt.toISOString(),
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    return [];
  }
}

/**
 * Fetch published blog posts for storefront display.
 */
export async function getStorefrontBlogsAction() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });

    if (blogs.length === 0 && INITIAL_BLOGS.length > 0) {
      return INITIAL_BLOGS;
    }

    return blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage,
      authorName: b.authorName,
      authorAvatar: b.authorAvatar || undefined,
      category: b.category,
      tags: b.tags || undefined,
      readTime: b.readTime,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt.toISOString(),
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching storefront blogs:', error);
    return INITIAL_BLOGS;
  }
}

/**
 * Fetch a single blog post by slug.
 */
export async function getBlogBySlugAction(slug: string) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: { comments: { orderBy: { createdAt: 'desc' } } },
    });

    if (!blog) {
      const fallback = INITIAL_BLOGS.find((b) => b.slug === slug) || INITIAL_BLOGS[0];
      return fallback ? { ...fallback, comments: [] } : null;
    }

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      authorName: blog.authorName,
      authorAvatar: blog.authorAvatar || undefined,
      category: blog.category,
      tags: blog.tags || undefined,
      readTime: blog.readTime,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt.toISOString(),
      createdAt: blog.createdAt.toISOString(),
      comments: blog.comments.map((c) => ({
        id: c.id,
        userName: c.userName,
        userEmail: c.userEmail,
        comment: c.comment,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    const fallback = INITIAL_BLOGS.find((b) => b.slug === slug) || INITIAL_BLOGS[0];
    return fallback ? { ...fallback, comments: [] } : null;
  }
}

/**
 * Create a new Blog post in PostgreSQL database.
 */
export async function createBlogAction(data: CreateBlogInput) {
  if (!data.title || !data.excerpt) {
    return { success: false, error: 'Article Title and Excerpt are required.' };
  }

  try {
    const baseSlug = data.slug || data.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const blog = await prisma.blog.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt: data.excerpt.trim(),
        content: data.content ? data.content.trim() : data.excerpt.trim(),
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200',
        authorName: data.authorName || 'Angel Editorial',
        authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        category: data.category || 'Haute Couture',
        tags: data.tags || null,
        readTime: data.readTime || '5 min read',
        isPublished: data.isPublished ?? true,
      },
    });

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');

    return {
      success: true,
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        authorName: blog.authorName,
        authorAvatar: blog.authorAvatar || undefined,
        category: blog.category,
        tags: blog.tags || undefined,
        readTime: blog.readTime,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt.toISOString(),
        createdAt: blog.createdAt.toISOString(),
      },
      message: 'Blog article published successfully!',
    };
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return { success: false, error: error.message || 'Failed to create blog post.' };
  }
}

/**
 * Update an existing Blog post in PostgreSQL database.
 * Updates the existing record by ID (does NOT create duplicates).
 */
export async function updateBlogAction(id: string, data: Partial<CreateBlogInput>) {
  if (!id) {
    return { success: false, error: 'Blog ID is required for update.' };
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Blog post not found in database.' };
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        excerpt: data.excerpt !== undefined ? data.excerpt.trim() : undefined,
        content: data.content !== undefined ? data.content.trim() : undefined,
        coverImage: data.coverImage !== undefined ? data.coverImage : undefined,
        authorName: data.authorName !== undefined ? data.authorName : undefined,
        authorAvatar: data.authorAvatar !== undefined ? data.authorAvatar : undefined,
        category: data.category !== undefined ? data.category : undefined,
        tags: data.tags !== undefined ? data.tags : undefined,
        readTime: data.readTime !== undefined ? data.readTime : undefined,
        isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
      },
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath('/admin/blogs');

    return {
      success: true,
      blog: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        excerpt: updated.excerpt,
        content: updated.content,
        coverImage: updated.coverImage,
        authorName: updated.authorName,
        authorAvatar: updated.authorAvatar || undefined,
        category: updated.category,
        tags: updated.tags || undefined,
        readTime: updated.readTime,
        isPublished: updated.isPublished,
        publishedAt: updated.publishedAt.toISOString(),
        createdAt: updated.createdAt.toISOString(),
      },
      message: 'Blog post updated successfully!',
    };
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return { success: false, error: error.message || 'Failed to update blog post.' };
  }
}

/**
 * Delete a Blog post from PostgreSQL database.
 */
export async function deleteBlogAction(id: string) {
  if (!id) {
    return { success: false, error: 'Blog ID is required.' };
  }

  try {
    await prisma.blog.delete({ where: { id } });

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');

    return { success: true, message: 'Blog post deleted successfully!' };
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message || 'Failed to delete blog post.' };
  }
}
