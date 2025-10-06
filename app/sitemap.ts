// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://thepakeru.com";

type ProductData = {
  _id: string;
  updatedAt?: string;
  createdAt?: string;
};

type GalleryData = {
  _id: string;
  name: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  const [products, galleries] = await Promise.all([
    fetchProductsServer(),
    fetchCollectionsServer(),
  ]);

  // Map product URLs
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product._id}`,
    lastModified: product.updatedAt
      ? new Date(product.updatedAt)
      : new Date(product.createdAt || currentDate),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Map gallery/collection URLs
  const galleryUrls: MetadataRoute.Sitemap = galleries.map((gallery) => ({
    url: `${BASE_URL}/collections/${gallery._id}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...galleryUrls, ...productUrls];
}

async function fetchProductsServer(): Promise<ProductData[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products?limit=25`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache:"no-store"
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to fetch products: ${response.status}`);
      return [];
    }

    const result = await response.json();

    if (!result || !Array.isArray(result.data)) {
      console.error("❌ Invalid product response format:", result);
      return [];
    }

    return result.data.map((product: any) => ({
      _id: product._id,
      updatedAt: product.updatedAt,
      createdAt: product.createdAt,
    }));
  } catch (error) {
    console.error("⚠️ Error fetching products for sitemap:", error);
    return [];
  }
}

async function fetchCollectionsServer(): Promise<GalleryData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/landing-page`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch collections: ${response.status}`);
      return [];
    }

    const result = await response.json();

    // Make sure section3 exists and is an array
    if (!Array.isArray(result?.section3)) {
      console.error("❌ Invalid collection data structure:", result);
      return [];
    }

    return result.section3.map((gallery: any) => ({
      _id: gallery._id,
      name: gallery.name,
    }));
  } catch (error) {
    console.error("⚠️ Error fetching collections for sitemap:", error);
    return [];
  }
}
