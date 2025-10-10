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
    variants: ProductColor[],
    post: ReturnType<typeof useApiClient>["post"]
  ): Promise<any> {
    await this.compressImagesInBatch(variants);

    const createPromise = this.createProductWithFiles(data, variants, post);

    return toast.promise(createPromise, {
      loading: {
        title: "Creating product...",
        description: "Please wait while we process your product",
        duration: Infinity,
      },
      success: {
        title: `Product "${data.name}" created successfully`,
        description: "Your product is now available in the catalog",
      },
      error: (error) => ({
        title: "Failed to create product",
        description: error?.message?.message || "Please try again",
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
    patch: ReturnType<typeof useApiClient>["patch"],
    removedVariantIds?: string[]
  ): Promise<any> {
    console.log(productId, "id");

    // Use ProductChangeDetector instead of local methods
    const changes = ProductChangeDetector.detectChanges(
      originalData,
      originalColors,
      currentData,
      currentColors
    );

    if (!changes.hasChanges) {
      return { message: "No changes to save" };
    }

    console.log("Detected changes:", changes.formChanges);
    console.log("Removed variants:", removedVariantIds);

    const hasNewFiles = [
      ...changes.colorChanges.added,
      ...changes.colorChanges.updated,
    ].some((color) =>
      color.images?.some(
        (img) => img.file instanceof File || img.file instanceof Blob
      )
    );

    let updatePayload: FormData | any;

    if (hasNewFiles) {
      const colorsWithNewFiles = [
        ...changes.colorChanges.added,
        ...changes.colorChanges.updated,
      ].filter((color) =>
        color.images?.some(
          (img) => img.file instanceof File || img.file instanceof Blob
        )
      );

      await this.compressImagesInBatch(colorsWithNewFiles);
      updatePayload = await this.buildFormData(
        { ...changes.formChanges },
        [...changes.colorChanges.updated, ...changes.colorChanges.added],
        { partial: true }
      );
    } else {
      updatePayload = this.buildJsonPayload(
        { ...changes.formChanges },
        currentColors,
        { partial: true }
      );
    }

    if (removedVariantIds && removedVariantIds.length > 0) {
      if (updatePayload instanceof FormData) {
        for (const id of removedVariantIds) {
          updatePayload.append("removedVariants[]", id);
        }
      } else {
        updatePayload.removedVariants = removedVariantIds;
      }
    }

    console.log(updatePayload, "payload with removed variants");

    const url = `/products/${productId}`;

    const updatePromise = patch(url, updatePayload, {
      requiresAuth: true,
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });

    return toast.promise(updatePromise, {
      loading: {
        title: "Updating product...",
        description: "Please wait while we process your product",
        duration: Infinity,
      },
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
    const deletePromise = del(`/products/${productId}`, {
      requiresAuth: true,
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });

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
    variants: ProductColor[],
    post: ReturnType<typeof useApiClient>["post"]
  ): Promise<any> {
    const formData = await this.buildFormData(data, variants);
    return post("/products", formData, {
      requiresAuth: true,
      cache: "no-store",
    });
  }

  private static async appendImageFiles(
    formData: FormData,
    variants: ProductColor[]
  ): Promise<void> {
    for (const variant of variants) {
      if (!variant.images?.length) continue;

      for (const img of variant.images) {
        if (img.file instanceof File || img.file instanceof Blob) {
          const file =
            img.file instanceof File
              ? img.file
              : new File([img.file], img.name || "image", {
                  type: img.file.type,
                });
          const compressedFile = await this.compressImageIfNeeded(file);
          formData.append("images", compressedFile);
        }
      }
    }
  }

  private static async buildFormData(
    data: Partial<ProductFormData>,
    variants: ProductColor[],
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
    appendField("productCare", data.productCare);

    if (!partial || data.price !== undefined) {
      const price = this.parsePrice(data.price ?? "0");
      formData.append("price", price.toString());
    }

    if (!partial || data.sizeType !== undefined) {
      formData.append("sizeType[gender]", data.sizeType?.gender || "");
      formData.append("sizeType[clothType]", data.sizeType?.clothType || "");
    }

    if (!partial || data.washInstructions !== undefined) {
      (data.washInstructions || [])
        .filter((instruction: string) => instruction?.trim())
        .forEach((instruction: string) => {
          formData.append("washInstructions[]", instruction.trim());
        });
    }

    if (!partial || data.totalNumber !== undefined) {
      const colorStock = variants.reduce((sum, c) => sum + (c.stock || 0), 0);
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

    if (variants?.length) {
      const variantsBuild = this.buildVariants(variants, { isUpdate: partial });
      formData.append("variants", JSON.stringify(variantsBuild));

      await this.appendImageFiles(formData, variants);
    }

    return formData;
  }

  private static buildJsonPayload(
    data: Partial<ProductFormData>,
    variants: ProductColor[],
    options: { partial?: boolean } = {}
  ): any {
    const { partial = false } = options;

    const payload: any = {};

    const appendField = (key: keyof ProductFormData, value: any) => {
      if (partial && value === undefined) return;
      if (value !== undefined && value !== null && value !== "") {
        payload[key] = value;
      }
    };

    appendField("name", data.name?.trim());
    appendField("description", data.description?.trim());
    appendField("status", data.status);
    appendField("category", data.category?.trim());
    appendField("productCare", data.productCare?.trim());

    if (!partial || data.price !== undefined) {
      payload.price = this.parsePrice(data.price ?? "0");
    }

    if (!partial || data.sizeType !== undefined) {
      payload.sizeType = {
        gender: data.sizeType?.gender || "",
        clothType: data.sizeType?.clothType || "",
      };
    }

    if (!partial || data.washInstructions !== undefined) {
      payload.washInstructions = (data.washInstructions || [])
        .filter((instruction: string) => instruction?.trim())
        .map((instruction: string) => instruction.trim());
    }

    if (!partial || data.totalNumber !== undefined) {
      const colorStock = variants.reduce((sum, c) => sum + (c.stock || 0), 0);
      payload.totalNumber =
        colorStock > 0 ? colorStock : this.parsePrice(data.totalNumber || "0");
    }

    if (!partial || data.tags !== undefined) {
      const validTags = Array.isArray(data.tags)
        ? data.tags.filter((tag) => tag?.trim())
        : [];
      if (validTags.length) {
        payload.tags = validTags.map((tag) => tag.trim());
      }
    }

    if (variants?.length) {
      payload.variants = variants.map((variant) => ({
        _id: variant._id,
        color: variant.name?.trim(),
        colorHex: variant.hex,
        sizes: variant.sizes,
        stock: variant.stock,
        images: (variant.images || []).map((img) => ({
          _id: img._id,
          url: img.url,
          name: img.name,
        })),
      }));
    }

    return payload;
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

  private static buildVariants(
    variants: ProductColor[],
    options: { isUpdate?: boolean } = {}
  ): any[] {
    if (!variants?.length) {
      return [];
    }

    const { isUpdate = false } = options;

    return variants
      .map((variant) => {
        const variantData: any = {
          color:
            variant.name?.trim() || variant.color?.trim() || "Unknown Color",
          colorHex: variant.hex || "#000000",
          sizes: variant.sizes || [],
          stock: variant.stock || 0,
          images: (variant.images || [])
            .filter((img) => img.name?.trim())
            .map((img) => img.name.trim()),
        };

        if (isUpdate && variant._id) {
          variantData._id = variant._id;
        }

        console.log(variantData, "");

        return variantData;
      })
      .filter((variant) => variant.color !== "Unknown variant");
  }

  private static async compressImagesInBatch(
    variants: ProductColor[]
  ): Promise<void> {
    let totalSize = 0;

    for (const variant of variants) {
      if (!variant.images?.length) continue;

      for (const img of variant.images) {
        if (img.file instanceof File || img.file instanceof Blob) {
          const file =
            img.file instanceof File
              ? img.file
              : new File([img.file], img.name || "image", {
                  type: img.file.type,
                });
          const compressedFile = await this.compressImageIfNeeded(file);
          totalSize += compressedFile.size;

          if (totalSize > this.MAX_TOTAL_SIZE) {
            throw new Error(
              `Total file size (${(totalSize / 1024 / 1024).toFixed(
                1
              )}MB) exceeds the ${this.MAX_TOTAL_SIZE / 1024 / 1024}MB limit`
            );
          }
          img.file = compressedFile;
        }
      }
    }
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

      const newSizes = (variant.sizes || []).filter(
        (size) => size && !existingColor.sizes.includes(size)
      );
      existingColor.sizes.push(...newSizes);
      existingColor.stock += variant.stock || 0;

      if (variant.images?.length) {
        const mappedImages = variant.images.map((img, imgIndex) => ({
          _id: String(img._id ?? existingColor.images.length + imgIndex + 1),
          url: img.url,
          name:
            img.publicId?.trim() ||
            `image-${existingColor.images.length + imgIndex}`,
          file: undefined,
        }));
        existingColor.images.push(...mappedImages);
      }
    } else {
      const mappedImages: ProductImage[] = (variant.images || []).map(
        (img, imgIndex) => ({
          _id: String(img._id ?? imgIndex + 1),
          url: img.url,
          name: img.publicId?.trim() || `image-${imgIndex}`,
          file: undefined,
        })
      );

      colorMap.set(colorKey, {
        _id: String(variant._id ?? colorMap.size + 1),
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
