import { MetadataRoute } from 'next';
import { db as prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://angelcollection.com';

  const staticPages = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/faq',
    '/privacy-policy',
    '/terms',
    '/refund-policy',
    '/track-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    const productPages = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages];
  } catch (e) {
    return staticPages;
  }
}
