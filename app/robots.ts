// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/shopping-cart',       
          '/payment',  
          '/account',    
          '/admin',     
          '/api',       
          '/search',     
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
           '/shopping-cart',      
          '/payment',  
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