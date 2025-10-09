// utils/changeDetector.ts
import { ProductColor, ProductFormData } from "@/app/ui/dashboard/zodSchema";

export interface ProductChanges {
  formChanges: Partial<ProductFormData>;
  colorChanges: {
    added: ProductColor[];
    updated: ProductColor[];
    removed: string[];
  };
  hasChanges: boolean;
}

/**
 * Improved change detector with better deep comparison
 */
export class ProductChangeDetector {
  /**
   * Deep equality check with proper handling of all types
   */
  private static deepEqual(a: any, b: any): boolean {
    // Handle null/undefined
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    // Handle primitives
    if (typeof a !== "object") return a === b;

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      
      // Sort arrays of primitives for comparison (handles tags, sizes, etc.)
      if (a.length > 0 && typeof a[0] !== "object") {
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((item, i) => item === sortedB[i]);
      }
      
      // For arrays of objects, compare element by element
      return a.every((item, i) => this.deepEqual(item, b[i]));
    }

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    // Handle objects
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();

    if (keysA.length !== keysB.length) return false;
    if (!keysA.every((key, i) => key === keysB[i])) return false;

    return keysA.every((key) => this.deepEqual(a[key], b[key]));
  }

  /**
   * Normalize value for comparison (trim strings, ensure consistent types)
   */
  private static normalizeValue(value: any): any {
    if (value == null) return value;
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) {
      return value.map((v) => this.normalizeValue(v));
    }
    if (typeof value === "object") {
      const normalized: any = {};
      for (const key in value) {
        normalized[key] = this.normalizeValue(value[key]);
      }
      return normalized;
    }
    return value;
  }

  /**
   * Detect changes in form data (excluding colors)
   */
  static detectFormChanges(
    original: ProductFormData,
    current: ProductFormData
  ): Partial<ProductFormData> {
    const changes: Partial<ProductFormData> = {};

    const fieldsToCheck: (keyof ProductFormData)[] = [
      "name",
      "description",
      "price",
      "totalNumber",
      "status",
      "category",
      "tags",
      "productCare",
      "washInstructions",
      "sizeType",
    ];

    fieldsToCheck.forEach((field) => {
      const originalValue = this.normalizeValue(original[field]);
      const currentValue = this.normalizeValue(current[field]);

      if (!this.deepEqual(originalValue, currentValue)) {
        changes[field] = current[field] as any;
      }
    });

    return changes;
  }

  /**
   * Compare two images
   */
  private static areImagesEqual(
    img1: any,
    img2: any
  ): boolean {
    const hasFile1 = img1.file instanceof File || img1.file instanceof Blob;
    const hasFile2 = img2.file instanceof File || img2.file instanceof Blob;

    // If one has a new file and the other doesn't, they're different
    if (hasFile1 !== hasFile2) return false;

    // If both have new files, compare file properties
    if (hasFile1 && hasFile2) {
      const file1 = img1.file;
      const file2 = img2.file;
      
      // Compare file names, sizes, and types
      return (
        file1.name === file2.name &&
        file1.size === file2.size &&
        file1.type === file2.type
      );
    }

    // If neither has files, compare existing image data
    // Check _id, url, and name
    return (
      img1._id === img2._id &&
      img1.url === img2.url &&
      img1.name === img2.name
    );
  }

  /**
   * Compare two colors deeply, including images
   */
  private static areColorsEqual(
    color1: ProductColor,
    color2: ProductColor
  ): boolean {
    // Compare basic fields
    if (
      color1.name?.trim() !== color2.name?.trim() ||
      color1.hex !== color2.hex ||
      color1.stock !== color2.stock
    ) {
      return false;
    }

    // Compare sizes (order-independent)
    const sizes1 = [...(color1.sizes || [])].sort();
    const sizes2 = [...(color2.sizes || [])].sort();
    if (!this.deepEqual(sizes1, sizes2)) {
      return false;
    }

    // Compare images count
    const images1 = color1.images || [];
    const images2 = color2.images || [];
    
    if (images1.length !== images2.length) {
      return false;
    }

    // Create maps of images by _id for better comparison
    const imageMap1 = new Map(images1.map((img) => [img._id, img]));
    const imageMap2 = new Map(images2.map((img) => [img._id, img]));

    // Check if all image IDs match
    const ids1 = Array.from(imageMap1.keys()).sort();
    const ids2 = Array.from(imageMap2.keys()).sort();
    
    if (!this.deepEqual(ids1, ids2)) {
      // Different image IDs means images were added/removed/reordered
      return false;
    }

    // Compare each image by ID
    for (const [id, img1] of imageMap1) {
      const img2 = imageMap2.get(id);
      if (!img2 || !this.areImagesEqual(img1, img2)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect changes in color variants with better comparison
   */
  static detectColorChanges(
    originalColors: ProductColor[],
    currentColors: ProductColor[]
  ) {
    const changes = {
      added: [] as ProductColor[],
      updated: [] as ProductColor[],
      removed: [] as string[],
    };

    // Create maps for easier lookup
    const originalMap = new Map(originalColors.map((c) => [c._id, c]));
    const currentMap = new Map(currentColors.map((c) => [c._id, c]));

    // Find removed colors
    originalColors.forEach((color) => {
      if (!currentMap.has(color._id)) {
        changes.removed.push(color._id);
      }
    });

    // Find added and updated colors
    currentColors.forEach((currentColor) => {
      const originalColor = originalMap.get(currentColor._id);

      if (!originalColor) {
        // New color (no _id match in original)
        changes.added.push(currentColor);
      } else if (!this.areColorsEqual(originalColor, currentColor)) {
        // Color exists but has changes
        changes.updated.push(currentColor);
      }
    });

    return changes;
  }

  /**
   * Main method to detect all changes
   */
  static detectChanges(
    originalData: ProductFormData,
    originalColors: ProductColor[],
    currentData: ProductFormData,
    currentColors: ProductColor[]
  ): ProductChanges {
    const formChanges = this.detectFormChanges(originalData, currentData);
    const colorChanges = this.detectColorChanges(originalColors, currentColors);

    const hasFormChanges = Object.keys(formChanges).length > 0;
    const hasColorChanges =
      colorChanges.added.length > 0 ||
      colorChanges.updated.length > 0 ||
      colorChanges.removed.length > 0;

    // Debug logging
    console.log("🔍 Change Detection Results:");
    console.log("  Form changes:", hasFormChanges ? formChanges : "None");
    console.log("  Colors added:", colorChanges.added.length);
    console.log("  Colors updated:", colorChanges.updated.length);
    console.log("  Colors removed:", colorChanges.removed.length);

    return {
      formChanges,
      colorChanges,
      hasChanges: hasFormChanges || hasColorChanges,
    };
  }

  /**
   * Helper to check if a specific field changed
   */
  static hasFieldChanged(
    original: ProductFormData,
    current: ProductFormData,
    field: keyof ProductFormData
  ): boolean {
    const originalValue = this.normalizeValue(original[field]);
    const currentValue = this.normalizeValue(current[field]);
    return !this.deepEqual(originalValue, currentValue);
  }
}