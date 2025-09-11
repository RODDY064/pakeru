import { ProductFormData } from "@/app/ui/dashboard/zodSchema";
import { ProductColor, ProductImage } from "./action";
import { compressImage } from "@/libs/imageCompression";
import { ProductVariant } from "@/store/dashbaord/products";

export class ProductAPIService {
  private static getHeaders(includeContentType = false): HeadersInit {
    const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || parsedError.error || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async createProduct(
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error("Base URL not configured");
    console.log("creating..");

    return this.createProductWithFiles(data, colors);
  }

  static async updateProduct(
    productId: string,
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error("Base URL not configured");
    console.log("updating..");

    return this.updateProductWithFiles(productId, data, colors);
  }

  static async deleteProduct(productId: string): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error("Base URL not configured");

    const response = await fetch(`${baseUrl}/products/${productId}`, {
      method: "DELETE",
      // credentials: "include",
      headers: this.getHeaders(true),
    });

    console.log(response,"response")

    return this.handleResponse(response);
  }

  private static async createProductWithFiles(
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const formData = await this.prepareFormData(data, colors);
    
    const response = await fetch(`${baseUrl}/products`, {
      method: "POST",
      // credentials: "include",
      headers: this.getHeaders(false),
      body: formData,
    });

    return this.handleResponse(response);
  }

  private static async updateProductWithFiles(
    productId: string,
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const formData = await this.prepareFormData(data, colors);

    const response = await fetch(`${baseUrl}/products/${productId}`, {
      method: "PATCH",
      // credentials: "include",
      headers: this.getHeaders(false),
      body: formData,
    });

    return this.handleResponse(response);
  }

  private static async prepareFormData(
    data: ProductFormData,
    colors: ProductColor[]
  ): Promise<FormData> {
    const formData = new FormData();
    let totalSize = 0;

    console.log("Starting image compression and processing...");

    // Process and compress images
    const processedColors = await Promise.all(
      colors.map(async (color, colorIndex) => {
        console.log(`Processing color ${colorIndex + 1}: ${color.name}`);
        
        const processedImages = await Promise.all(
          color.images.map(async (img, imgIndex) => {
            if (img.file instanceof File) {
              console.log(`Processing image: ${img.file.name}, size: ${img.file.size} bytes`);
              let fileToUpload = img.file;

              // Compress if file is larger than 1MB
              if (img.file.size > 1024 * 1024) {
                try {
                  console.log(`Compressing ${img.file.name}...`);
                  fileToUpload = await compressImage(img.file, {
                    maxSizeMB: 1,
                  });
                  console.log(`Compressed ${img.file.name} from ${img.file.size} to ${fileToUpload.size} bytes`);
                } catch (error) {
                  console.error(`Failed to compress ${img.file.name}:`, error);
                  // Keep original file if compression fails
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

    // Check total size limit
    if (totalSize > 45 * 1024 * 1024) {
      throw new Error("Total file size too large. Please reduce image sizes.");
    }

    // Add basic fields
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

    // Prepare variants data with image names
    const variants = processedColors.map((color) => ({
      color: color.name,
      colorHex: color.hex,
      sizes: color.sizes || [],
      stock: color.stock || 0,
      images: color.images.map((img) => img.name),
    }));
    formData.append("variants", JSON.stringify(variants));

    // Add image files and metadata - FIX IS HERE
    let fileIndex = 0;
    console.log("Appending files to FormData...");
    
    for (const color of processedColors) {
      if (!color.images || color.images.length === 0) {
        console.warn(`Skipping color ${color.name} - no images`);
        continue;
      }

      console.log(color.images, "color images");
      
      for (const img of color.images) {
        // FIXED: Check for both File and Blob since compressed images return Blob
        if (img.file && (img.file instanceof File || img.file instanceof Blob)) {
          console.log(`Appending file ${fileIndex}: ${img.name} (${img.file.size} bytes) for color: ${color.name}`);
    
          // Create a File object from Blob if needed (to preserve filename)
          const fileToAppend = img.file instanceof File ? img.file : 
            new File([img.file], img.name, { type: img.file.type });
          
          formData.append("images", fileToAppend);
          fileIndex++;
        } else {
          console.warn(`Skipping image ${img.name} in color ${color.name} - no file object`);
        }
      }
    }

    console.log(`Total files appended: ${fileIndex}`);

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    return formData;
  }
}

export const mapVariantsToColors = (
  variants: ProductVariant[]
): ProductColor[] => {
  const colorMap = new Map<string, ProductColor>();

  variants.forEach((variant, index) => {
    const colorKey = variant.color || `color-${index}`;

    // If color already exists, update it; otherwise create new one
    if (colorMap.has(colorKey)) {
      const existingColor = colorMap.get(colorKey)!;

      // Add sizes if they don't exist
      const newSizes =
        variant.sizes?.filter((size) => !existingColor.sizes.includes(size)) ||
        [];
      existingColor.sizes.push(...newSizes);

      // Add stock
      existingColor.stock += variant.stock || 0;

      // Add images if they exist
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
      // Create new color entry
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