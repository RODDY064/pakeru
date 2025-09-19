import { ProductFormData } from "@/app/ui/dashboard/zodSchema";
import { ProductColor, ProductImage } from "./action";
import { compressImage } from "@/libs/imageCompression";
import { ProductVariant } from "@/store/dashbaord/products";
import { toast } from "@/app/ui/toaster";
import { useApiClient } from "@/libs/useApiClient";

export class ProductAPIService {

  static async createProduct(
    data: ProductFormData,
    colors: ProductColor[],
    post: ReturnType<typeof useApiClient>["post"]
  ): Promise<any> {
    const createPromise = this.createProductWithFiles(data, colors, post);

    return toast.promise(createPromise, {
      loading: "Creating product...",
      success: (result) => ({
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
    data: ProductFormData,
    colors: ProductColor[],
    patch: ReturnType<typeof useApiClient>["patch"]
  ): Promise<any> {
    const updatePromise = this.updateProductWithFiles(productId, data, colors, patch);

    return toast.promise(updatePromise, {
      loading: "Updating product...",
      success: (result) => ({
        title: `Product "${data.name}" updated successfully`,
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
    del: ReturnType<typeof useApiClient>["delete"]
  ): Promise<any> {
    const deletePromise = (async () => {
      const response = await del(`/products/${productId}`, {
         requiresAuth:true
      });

      return response;
    })();

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
    const formData = await this.prepareFormData(data, colors);

    const response = await post("/products", formData,{ requiresAuth:true });

    return response;
  }

  private static async updateProductWithFiles(
    productId: string,
    data: ProductFormData,
    colors: ProductColor[],
    patch: ReturnType<typeof useApiClient>["patch"]
  ): Promise<any> {
    const formData = await this.prepareFormData(data, colors);

    const response = await patch(`/products/${productId}`, formData,{ requiresAuth: true });

    return response;
  }

  private static async prepareFormData(
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<FormData> {
    const formData = new FormData();
    let totalSize = 0;

    console.log("Starting image compression and processing...");

    const processedColors = await Promise.all(
      colors.map(async (color, colorIndex) => {
        console.log(`Processing color ${colorIndex + 1}: ${color.name}`);

        const processedImages = await Promise.all(
          color.images.map(async (img, imgIndex) => {
            if (img.file instanceof File) {
              console.log(`Processing image: ${img.file.name}, size: ${img.file.size} bytes`);
              let fileToUpload = img.file;

              if (img.file.size > 1024 * 1024) {
                try {
                  console.log(`Compressing ${img.file.name}...`);
                  fileToUpload = await compressImage(img.file, {
                    maxSizeMB: 1,
                  });
                  console.log(`Compressed ${img.file.name} from ${img.file.size} to ${fileToUpload.size} bytes`);
                } catch (error) {
                  console.error(`Failed to compress ${img.file.name}:`, error);
                  fileToUpload = img.file;
                }
              }

              totalSize += fileToUpload.size;
              return {
                ...img,
                file: fileToUpload,
              };
            }
            return img;
          })
        );

        return {
          ...color,
          images: processedImages,
        };
      })
    );

    console.log(`Total file size after compression: ${totalSize} bytes`);

    if (totalSize > 45 * 1024 * 1024) {
      throw new Error("Total file size too large. Please reduce image sizes.");
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("status", data.status);
    formData.append(
      "price",
      String(
        typeof data.price === "string"
          ? parseFloat(data.price.replace(/[^\d.]/g, ""))
          : data.price
      )
    );
    formData.append(
      "totalNumber",
      String(
        processedColors.reduce((total, c) => total + (c.stock || 0), 0) ||
          Number(data.totalNumber)
      )
    );
    formData.append("category", data.category);

    (data.tags || []).forEach((tag) => formData.append("tags[]", tag));

    const variants = processedColors.map((color) => ({
      color: color.name,
      colorHex: color.hex,
      sizes: color.sizes || [],
      stock: color.stock || 0,
      images: color.images.map((img) => img.name),
    }));
    formData.append("variants", JSON.stringify(variants));

    let fileIndex = 0;
    console.log("Appending files to FormData...");

    for (const color of processedColors) {
      if (!color.images || color.images.length === 0) {
        console.warn(`Skipping color ${color.name} - no images`);
        continue;
      }

      console.log(color.images, "color images");

      for (const img of color.images) {
        if (img.file && (img.file instanceof File || img.file instanceof Blob)) {
          console.log(`Appending file ${fileIndex}: ${img.name} (${img.file.size} bytes) for color: ${color.name}`);

          const fileToAppend = img.file instanceof File
            ? img.file
            : new File([img.file], img.name, { type: img.file.type });

          formData.append("images", fileToAppend);
          fileIndex++;
        } else {
          console.warn(`Skipping image ${img.name} in color ${color.name} - no file object`);
        }
      }
    }

    console.log(`Total files appended: ${fileIndex}`);
    return formData;
  }
}

export const mapVariantsToColors = (
  variants: ProductVariant[]
): ProductColor[] => {
  const colorMap = new Map<string, ProductColor>();

  variants.forEach((variant, index) => {
    const colorKey = variant.color || `color-${index}`;

    if (colorMap.has(colorKey)) {
      const existingColor = colorMap.get(colorKey)!;

      const newSizes =
        variant.sizes?.filter((size) => !existingColor.sizes.includes(size)) ||
        [];
      existingColor.sizes.push(...newSizes);

      existingColor.stock += variant.stock || 0;

      if (variant.images && variant.images.length > 0) {
        const mappedImages = variant.images.map((img, imgIndex) => ({
          _id: existingColor.images.length + imgIndex + 1,
          url: img.url,
          name: `image-${imgIndex}`,
          file: undefined,
        }));
        existingColor.images.push(...mappedImages);
      }
    } else {
      const mappedImages: ProductImage[] =
        variant.images?.map((img, imgIndex) => ({
          _id: imgIndex + 1,
          url: img.url,
          name: img.productId || `image-${imgIndex}`,
          file: undefined,
        })) || [];

      colorMap.set(colorKey, {
        _id: colorMap.size + 1,
        name: variant.color || `Color ${colorMap.size + 1}`,
        color: variant.color || colorKey,
        hex: variant.colorHex || "#000000",
        images: mappedImages,
        stock: variant.stock || 0,
        sizes: variant.sizes || [],
      });
    }
  });

  return Array.from(colorMap.values());
};