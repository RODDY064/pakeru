// import { ProductFormData } from "@/app/ui/dashboard/zodSchema";
// import { ProductColor, ProductImage } from "./page";
// import { compressImage } from "@/libs/imageCompression";
// import { ProductVariant } from "@/store/dashbaord/products";

// export class ProductAPIService {
//   private static getHeaders(includeContentType = false): HeadersInit {
//     const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
//     const headers: HeadersInit = {
//       Authorization: `Bearer ${token}`
//     };

//     // headers["ngrok-skip-browser-warning"] = "true"

//     if (includeContentType) {
//       headers["Content-Type"] = "application/json";
//     }

//     return headers;
//   }

//   private static async handleResponse<T>(response: Response): Promise<T> {
//     if (!response.ok) {
//       const errorData = await response.text();
//       let errorMessage = `Request failed with status ${response.status}`;

//       try {
//         const parsedError = JSON.parse(errorData);
//         errorMessage = parsedError.message || parsedError.error || errorMessage;
//       } catch {
//         errorMessage = errorData || errorMessage;
//       }

//       throw new Error(errorMessage);
//     }

//     return response.json();
//   }

//   static async createProduct(
//     data: ProductFormData,
//     colors: ProductColor[]
//   ): Promise<any> {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//     if (!baseUrl) throw new Error("Base URL not configured");
//     console.log("creating..");

//     return this.createProductWithFiles(data, colors);
//   }

//   static async updateProduct(
//     productId: string,
//     data: ProductFormData,
//     colors: ProductColor[]
//   ): Promise<any> {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//     if (!baseUrl) throw new Error("Base URL not configured");
//     console.log("updating..");

//     return this.updateProductWithFiles(productId, data, colors);
//   }

//   static async deleteProduct(productId: string): Promise<any> {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//     if (!baseUrl) throw new Error("Base URL not configured");

//     const response = await fetch(`${baseUrl}/products/${productId}`, {
//       method: "DELETE",
//       headers: this.getHeaders(),
//     });

//     console.log(response,"response")

//     return this.handleResponse(response);
//   }

//   private static async createProductWithFiles(
//     data: ProductFormData,
//     colors: ProductColor[]
//   ): Promise<any> {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

//     const formData = await this.prepareFormData(data, colors);
    
//     const response = await fetch(`${baseUrl}/products`, {
//       method: "POST",
//       headers: this.getHeaders(false), // Don't include Content-Type for FormData
//       body: formData,
//     });

//     return this.handleResponse(response);
//   }

//   private static async updateProductWithFiles(
//     productId: string,
//     data: ProductFormData,
//     colors: ProductColor[]
//   ): Promise<any> {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//     const formData = await this.prepareFormData(data, colors);

//     const response = await fetch(`${baseUrl}/products/${productId}`, {
//       method: "PATCH",
//       headers: this.getHeaders(false),
//       body: formData,
//     });

//     return this.handleResponse(response);
//   }

//   private static async prepareFormData(
//     data: ProductFormData,
//     colors: ProductColor[]
//   ): Promise<FormData> {
//     const formData = new FormData();
//     let totalSize = 0;

//     // Compress images first
//     const processedColors = await Promise.all(
//       colors.map(async (color) => ({
//         ...color,
//         images: await Promise.all(
//           color.images.map(async (img) => {
//             if (img.file instanceof File) {
//               let fileToUpload = img.file;

//               if (img.file.size > 1024 * 1024) {
//                 try {
//                   fileToUpload = await compressImage(img.file, {
//                     maxSizeMB: 1,
//                   });
//                 } catch (error) {
//                   console.warn(`Failed to compress ${img.file.name}:`, error);
//                 }
//               }

//               totalSize += fileToUpload.size;
//               return { ...img, file: fileToUpload };
//             }
//             return img;
//           })
//         ),
//       }))
//     );

//     if (totalSize > 45 * 1024 * 1024) {
//       throw new Error("Total file size too large. Please reduce image sizes.");
//     }

//     // Add basic fields
//     formData.append("name", data.name);
//     formData.append("description", data.description);
//     formData.append("status", data.status);
//     formData.append(
//       "price",
//       String(
//         typeof data.price === "string"
//           ? parseFloat(data.price.replace(/[^\d.]/g, ""))
//           : data.price
//       )
//     );
//     formData.append(
//       "totalNumber",
//       String(
//         processedColors.reduce((total, c) => total + (c.stock || 0), 0) ||
//           Number(data.totalNumber)
//       )
//     );
//     formData.append("category", data.category);

//     (data.tags || []).forEach((tag) => formData.append("tags[]", tag));

//     // Add variants
//     const variants = processedColors.map((color) => ({
//       color: color.name,
//       colorHex: color.hex,
//       sizes: color.sizes || [],
//       stock: color.stock || 0,
//       images: color.images.map((img) => img.name),
//     }));
//     formData.append("variants", JSON.stringify(variants));

//     // Add files
//     let fileIndex = 0;
//     for (const color of processedColors) {
//       for (const img of color.images) {
//         if (img.file instanceof File) {
//           formData.append("images", img.file);
//           formData.append(
//             `fileMetadata[${fileIndex}]`,
//             JSON.stringify({
//               colorName: color.name,
//               originalName: img.name,
//             })
//           );
//           fileIndex++;
//         }
//       }
//     }

//     return formData;
//   }

// }

// export const mapVariantsToColors = (
//   variants: ProductVariant[]
// ): ProductColor[] => {
//   const colorMap = new Map<string, ProductColor>();

//   variants.forEach((variant, index) => {
//     const colorKey = variant.color || `color-${index}`;

//     // If color already exists, update it; otherwise create new one
//     if (colorMap.has(colorKey)) {
//       const existingColor = colorMap.get(colorKey)!;

//       // Add sizes if they don't exist
//       const newSizes =
//         variant.sizes?.filter((size) => !existingColor.sizes.includes(size)) ||
//         [];
//       existingColor.sizes.push(...newSizes);

//       // Add stock
//       existingColor.stock += variant.stock || 0;

//       // Add images if they exist
//       if (variant.images && variant.images.length > 0) {
//         const mappedImages = variant.images.map((img, imgIndex) => ({
//           id: existingColor.images.length + imgIndex + 1,
//           url: img.url,
//           name: `image-${imgIndex}`,
//           file: undefined,
//         }));
//         existingColor.images.push(...mappedImages);
//       }
//     } else {
//       // Create new color entry
//       const mappedImages: ProductImage[] =
//         variant.images?.map((img, imgIndex) => ({
//           id: imgIndex + 1,
//           url: img.url,
//           name: img.productId || `image-${imgIndex}`,
//           file: undefined,
//         })) || [];

//       colorMap.set(colorKey, {
//         id: colorMap.size + 1,
//         name: variant.color || `Color ${colorMap.size + 1}`,
//         color: variant.color || colorKey,
//         hex: variant.colorHex || "#000000",
//         images: mappedImages,
//         stock: variant.stock || 0,
//         sizes: variant.sizes || [],
//       });
//     }
//   });

//   return Array.from(colorMap.values());
// };

import { ProductFormData } from "@/app/ui/dashboard/zodSchema";
import { ProductColor, ProductImage } from "./page";
import { compressImage } from "@/libs/imageCompression";
import { ProductVariant } from "@/store/dashbaord/products";

export class ProductAPIService {
  private static getHeaders(includeContentType = false): HeadersInit {
    const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`
    };

    // headers["ngrok-skip-browser-warning"] = "true"

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
    
    // Debug: Check if colors have images
    console.log("Creating product with colors:", colors);
    console.log("Colors with images:", colors.map(c => ({
      name: c.name,
      imageCount: c.images?.length || 0,
      images: c.images?.map(img => ({
        name: img.name,
        hasFile: img.file instanceof File,
        fileSize: img.file instanceof File ? img.file.size : 'no file'
      }))
    })));

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
      headers: this.getHeaders(),
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
    
    // Debug: Log FormData contents
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    const response = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: this.getHeaders(false), // Don't include Content-Type for FormData
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

    // Validate that we have colors and images
    if (!colors || colors.length === 0) {
      throw new Error("No colors provided for product");
    }

    const hasAnyImages = colors.some(color => 
      color.images && color.images.length > 0 && 
      color.images.some(img => img.file instanceof File)
    );

    if (!hasAnyImages) {
      throw new Error("No valid image files found in colors. Please ensure each color has at least one image file.");
    }

    // Compress images first
    const processedColors = await Promise.all(
      colors.map(async (color) => {
        if (!color.images || color.images.length === 0) {
          console.warn(`Color ${color.name} has no images`);
          return { ...color, images: [] };
        }

        const processedImages = await Promise.all(
          color.images.map(async (img) => {
            if (!(img.file instanceof File)) {
              console.warn(`Image ${img.name} in color ${color.name} has no file`);
              return img;
            }

            let fileToUpload = img.file;

            if (img.file.size > 1024 * 1024) {
              try {
                fileToUpload = await compressImage(img.file, {
                  maxSizeMB: 1,
                });
                console.log(`Compressed ${img.file.name} from ${img.file.size} to ${fileToUpload.size} bytes`);
              } catch (error) {
                console.warn(`Failed to compress ${img.file.name}:`, error);
              }
            }

            totalSize += fileToUpload.size;
            return { ...img, file: fileToUpload };
          })
        );

        return { ...color, images: processedImages };
      })
    );

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

    // Add tags
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => formData.append("tags[]", tag));
    }

    // Add variants - only include colors that have images
    const validVariants = processedColors
      .filter(color => color.images && color.images.length > 0)
      .map((color) => ({
        color: color.name,
        colorHex: color.hex,
        sizes: color.sizes || [],
        stock: color.stock || 0,
        images: color.images
          .filter(img => img.file instanceof File)
          .map((img) => img.name),
      }));

    if (validVariants.length === 0) {
      throw new Error("No valid variants with images found");
    }

    formData.append("variants", JSON.stringify(validVariants));

    // Add files with better naming and metadata
    let fileIndex = 0;
    for (const color of processedColors) {
      if (!color.images || color.images.length === 0) continue;
      
      for (const img of color.images) {
        if (img.file instanceof File) {
          // Use a consistent naming pattern for the form field
          formData.append("images", img.file, img.file.name);
          
          // Add metadata for each file
          formData.append(
            `fileMetadata[${fileIndex}]`,
            JSON.stringify({
              colorName: color.name,
              originalName: img.name,
              fileName: img.file.name,
              fileSize: img.file.size,
            })
          );
          fileIndex++;
        }
      }
    }

    console.log(`Prepared FormData with ${fileIndex} image files`);
    
    // Final validation
    if (fileIndex === 0) {
      throw new Error("No image files were added to FormData");
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
          id: existingColor.images.length + imgIndex + 1,
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
          id: imgIndex + 1,
          url: img.url,
          name: img.productId || `image-${imgIndex}`,
          file: undefined,
        })) || [];

      colorMap.set(colorKey, {
        id: colorMap.size + 1,
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