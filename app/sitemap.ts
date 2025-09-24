// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thepakeru.com';
  const currentDate = new Date(); // Use today's date

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily', // Homepage updates frequently for e-commerce promotions
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily', // Shop page for new arrivals
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/graphic-tees`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/urban-outerwear`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/street-accessories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/limited-edition`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/unisex-clothing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly', // For fashion tips, news
      priority: 0.6,
    },
    // Add dynamic product pages here if fetching from API/DB, e.g.:
    // products.map((product) => ({
    //   url: `${baseUrl}/products/${product.slug}`,
    //   lastModified: product.updatedAt,
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // })),
  ];
}