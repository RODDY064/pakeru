import { ProductFormData } from "@/app/ui/dashboard/zodSchema";
import { ProductColor, ProductImage } from "./action";
import { compressImage } from "@/libs/imageCompression";
import { ProductVariant } from "@/store/dashbaord/products";
import { toast } from "@/app/ui/toaster";
import { useApiClient } from "@/libs/useApiClient";
import { ProductChangeDetector } from "./changeDetector";

export class ProductAPIService {
  private static readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
  private static readonly MAX_TOTAL_SIZE = 45 * 1024 * 1024; // 45MB

  static async createProduct(
    data: ProductFormData,
    colors: ProductColor[],
    post: ReturnType<typeof useApiClient>["post"]
  ): Promise<any> {
    const createPromise = this.createProductWithFiles(data, colors, post);

    return toast.promise(createPromise, {
      loading: "Creating product...",
      success: () => ({
        title: `Product "${data.name}" created successfully`,
        description: "Your product is now available in the catalog",
      }),
      error: (error) => ({
        title: "Failed to create product",
        description: error.message || "Please try again",
      }),
      position: "top-right",
    });
  }

  static async updateProduct(
    productId: string,
    currentData: ProductFormData,
    currentColors: ProductColor[],
    originalData: ProductFormData,
    originalColors: ProductColor[],
    patch: ReturnType<typeof useApiClient>["patch"]
  ): Promise<any> {
    const changes = ProductChangeDetector.detectChanges(
      originalData,
      originalColors,
      currentData,
      currentColors
    );

    if (!changes.hasChanges) {
      return { message: "No changes to save" };
    }

    console.log("🔍 Detected changes:", changes);

    const hasNewFiles = [
      ...changes.colorChanges.added,
      ...changes.colorChanges.updated,
    ].some((color) =>
      color.images?.some(
        (img) => img.file instanceof File || img.file instanceof Blob
      )
    );

    let updatePayload: FormData | Partial<ProductFormData>;

    if (hasNewFiles) {

      updatePayload = await this.buildFormData(
        { ...changes.formChanges },
        [...changes.colorChanges.updated, ...changes.colorChanges.added],
        { partial: true }
      );
    } else {
      updatePayload = {
        ...changes.formChanges,
        ...(changes.colorChanges.added.length ||
        changes.colorChanges.updated.length ||
        changes.colorChanges.removed.length
          ? { colors: currentColors }
          : {}),
      };
    }

    const updatePromise = patch(`/products/${productId}`, updatePayload, {
      requiresAuth: true,
    });

    return toast.promise(updatePromise, {
      loading: "Updating product...",
      success: () => ({
        title: `Product "${currentData.name}" updated successfully`,
        description: "Changes have been saved",
      }),
      error: (error) => ({
        title: "Failed to update product",
        description: error.message || "Please try again",
      }),
      position: "top-right",
    });
  }

  static async deleteProduct(
    productId: string,
    del: ReturnType<typeof useApiClient>["del"]
  ): Promise<any> {
    const deletePromise = del(`/products/${productId}`, { requiresAuth: true });

    return toast.promise(deletePromise, {
      loading: "Deleting product...",
      success: "Product deleted successfully",
      error: (error) => ({
        title: "Failed to delete product",
        description: error.message || "Please try again",
      }),
      position: "top-right",
    });
  }

  private static async createProductWithFiles(
    data: ProductFormData,
    colors: ProductColor[],
    post: ReturnType<typeof useApiClient>["post"]
  ): Promise<any> {
    const formData = await this.buildFormData(data, colors);
    return post("/products", formData, { requiresAuth: true });
  }

  // private static sanitizeFormData(data: ProductFormData): ProductFormData {
  //   return {
  //     name: data.name?.trim() || "",
  //     description: data.description?.trim() || "",
  //     price: data.price || "0",
  //     totalNumber: data.totalNumber || "0",
  //     status: data.status || "draft",
  //     category: data.category?.trim() || "",
  //     tags: Array.isArray(data.tags)
  //       ? data.tags.filter((tag) => tag?.trim())
  //       : [],
  //     colors: data.colors || [],
  //   };
  // }

  private static async buildFormData(
    data: Partial<ProductFormData>,
    colors: ProductColor[],
    options: { partial?: boolean } = {}
  ): Promise<FormData> {
    const { partial = false } = options;
    const formData = new FormData();

    const appendField = (key: keyof ProductFormData, value: any) => {
      if (partial && value === undefined) return;
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    };

    appendField("name", data.name?.trim());
    appendField("description", data.description?.trim());
    appendField("status", data.status);
    appendField("category", data.category?.trim());

    if (!partial || data.price !== undefined) {
      const price = this.parsePrice(data.price ?? "0");
      formData.append("price", price.toString());
    }

    if (!partial || data.totalNumber !== undefined) {
      const colorStock = colors.reduce((sum, c) => sum + (c.stock || 0), 0);
      const totalNumber =
        colorStock > 0 ? colorStock : this.parsePrice(data.totalNumber || "0");
      formData.append("totalNumber", totalNumber.toString());
    }

    if (!partial || data.tags !== undefined) {
      const validTags = Array.isArray(data.tags)
        ? data.tags.filter((tag) => tag?.trim())
        : [];
      validTags.forEach((tag) => formData.append("tags[]", tag.trim()));
    }

    if (colors?.length) {
      const variants = this.buildVariants(colors);
      formData.append("variants", JSON.stringify(variants));
      this.appendImageFiles(formData, colors);
    }

    return formData;
  }

  private static async processImages(
    colors: ProductColor[]
  ): Promise<ProductColor[]> {
    let totalSize = 0;

    const processed = await Promise.all(
      colors.map(async (color) => {
        if (!color.images?.length) {
          return { ...color, images: [] };
        }

        const processedImages = await Promise.all(
          color.images.map(async (img) => {
            if (!(img.file instanceof File)) {
              return img;
            }

            const compressedFile = await this.compressImageIfNeeded(img.file);
            totalSize += compressedFile.size;

            return { ...img, file: compressedFile };
          })
        );

        return { ...color, images: processedImages };
      })
    );

    if (totalSize > this.MAX_TOTAL_SIZE) {
      throw new Error(
        "Total file size exceeds 45MB limit. Please reduce image sizes."
      );
    }

    return processed;
  }

  private static async compressImageIfNeeded(file: File): Promise<File> {
    if (file.size <= this.MAX_FILE_SIZE) {
      return file;
    }

    try {
      return await compressImage(file, { maxSizeMB: 1 });
    } catch (error) {
      console.warn(
        `Compression failed for ${file.name}, using original:`,
        error
      );
      return file;
    }
  }

  private static parsePrice(price: string | number): number {
    if (typeof price === "number" && !isNaN(price)) return Math.max(0, price);
    if (!price) return 0;

    const cleaned = String(price).replace(/[^\d.,]/g, "");
    const parsed = parseFloat(cleaned.replace(",", "."));

    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  private static appendIfExists(
    formData: FormData,
    key: string,
    value: any
  ): void {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  }

  private static buildVariants(colors: ProductColor[]): any[] {
    if (!colors?.length) {
      return [];
    }

    return colors
      .map((color) => ({
        color: color.name?.trim() || color.color?.trim() || "Unknown Color",
        colorHex: color.hex || "#000000",
        sizes: color.sizes || [],
        stock: color.stock || 0,
        images: (color.images || [])
          .filter((img) => img.name?.trim())
          .map((img) => img.name.trim()),
      }))
      .filter((variant) => variant.color !== "Unknown Color"); // Only keep valid variants
  }

  private static appendImageFiles(
    formData: FormData,
    colors: ProductColor[]
  ): void {
    colors.forEach((color) => {
      if (!color.images?.length) return;

      color.images.forEach((img) => {
        if (img.file instanceof File || img.file instanceof Blob) {
          const file =
            img.file instanceof File
              ? img.file
              : new File([img.file], img.name || "image", {
                  type: img.file.type,
                });

          formData.append("images", file);
        }
      });
    });
  }
}

export const mapVariantsToColors = (
  variants: ProductVariant[]
): ProductColor[] => {
  if (!variants?.length) return [];

  const colorMap = new Map<string, ProductColor>();

  variants.forEach((variant, index) => {
    const colorKey = variant.color?.trim() || `color-${index}`;

    if (colorMap.has(colorKey)) {
      const existingColor = colorMap.get(colorKey)!;

      // Merge sizes (avoid duplicates)
      const newSizes = (variant.sizes || []).filter(
        (size) => size && !existingColor.sizes.includes(size)
      );
      existingColor.sizes.push(...newSizes);

      // Add stock
      existingColor.stock += variant.stock || 0;

      // Add images
      if (variant.images?.length) {
        const mappedImages = variant.images.map((img, imgIndex) => ({
          _id: existingColor.images.length + imgIndex + 1,
          url: img.url,
          name:
            img.productId || `image-${existingColor.images.length + imgIndex}`,
          file: undefined,
        }));
        existingColor.images.push(...mappedImages);
      }
    } else {
      const mappedImages: ProductImage[] = (variant.images || []).map(
        (img, imgIndex) => ({
          _id: imgIndex + 1,
          url: img.url,
          name: img.productId || `image-${imgIndex}`,
          file: undefined,
        })
      );

      colorMap.set(colorKey, {
        _id: colorMap.size + 1,
        name: colorKey,
        color: colorKey,
        hex: variant.colorHex || "#000000",
        images: mappedImages,
        stock: variant.stock || 0,
        sizes: variant.sizes || [],
      });
    }
  });

  return Array.from(colorMap.values());
};
