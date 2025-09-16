// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/shopping-cart',       // Prevent indexing cart pages
          '/payment',   // Sensitive user data
          '/account',    // User private areas
          '/admin',      // Admin panels if any
          '/api',        // API endpoints
          '/search',     // Dynamic search results
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/account',
          '/admin',
          '/api',
          '/search',
        ],
      },
    ],
    sitemap: 'https://thepakeru.com/sitemap.xml',
    host: 'https://thepakeru.com',
  };
}