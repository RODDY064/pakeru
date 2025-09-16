import { CategoryType } from "@/store/category";
import { ProductData } from "@/store/dashbaord/products";
import { apiCall } from "./functions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function fetchProductsServer(): Promise<ProductData[]> {
  try {
    if (!BASE_URL) {
      throw new Error("BASE_URL environment variable is not set");
    }

    const response = await apiCall("/products", {
      method: "GET",
      headers: { "Content-Type": "application/json"},
      cache: "no-store",
    },true);

    if (!response) {
      console.log(response)
      throw new Error(
        `Failed to fetch products: ${response.statusText}`
      );
    }

    const result = await response

    if (!result || !Array.isArray(result.data)) {
      throw new Error(
        "Invalid response format: expected { data: ProductData[] }"
      );
    }

    // Transform the data
    const products: ProductData[] = result.data.map((product: any) => {
      const firstVariant = product?.variants?.[0];
      return {
        ...product,
        id: product._id,
        colors: product.variants?.map((variant: any) => variant.color) || [],
        selectedColor: firstVariant?._id || null,
        mainImage: product.images?.[0]?.url || product.mainImage || "",
        sizes: firstVariant?.sizes || [],
        variants:
          product.variants?.map((variant: any) => ({
            ...variant,
            id: variant._id,
          })) || [],
      };
    });

    return products;
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
    return []; // Return empty array instead of throwing to prevent page crashes
  }
}

export async function fetchCategoriesServer(): Promise<CategoryType[]> {
  try {
    const response = await apiCall("/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },true);

    if (!response) {
      console.log(response);
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result = await response

    const categories: CategoryType[] = result.data.map((item: any) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      parentCategory: item.parentCategory,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }));

    return categories;
  } catch (error) {
    console.error("Failed to fetch categories on server:", error);
    return [];
  }
}

// Combined fetch function for initial data
export async function fetchInitialData() {
  const [products, categories] = await Promise.all([
    fetchProductsServer(),
    fetchCategoriesServer(),
  ]);

  return { products, categories };
}
