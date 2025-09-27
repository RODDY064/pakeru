// utils/changeDetector.ts

import { ProductColor, ProductFormData } from "@/app/ui/dashboard/zodSchema";


export interface ProductChanges {
  formChanges: Partial<ProductFormData>;
  colorChanges: {
    added: ProductColor[];
    updated: ProductColor[];
    removed: number[];
  };
  hasChanges: boolean;
}

/**
 * Clean utility to detect changes between original and current product data
 */
export class ProductChangeDetector {
  private static deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b) return a === b;
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, index) => this.deepEqual(item, b[index]));
    }
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    }
    
    return false;
  }

  /**
   * Detect changes in form data
   */
  static detectFormChanges(
    original: ProductFormData, 
    current: ProductFormData
  ): Partial<ProductFormData> {
    const changes: Partial<ProductFormData> = {};
    
    const fieldsToCheck: (keyof ProductFormData)[] = [
      'name', 'description', 'price', 'totalNumber', 
      'status', 'category', 'tags'
    ];

    fieldsToCheck.forEach(field => {
      if (!this.deepEqual(original[field], current[field])) {
        changes[field] = current[field] as any;
      }
    });

    return changes;
  }

  /**
   * Detect changes in color variants
   */
  static detectColorChanges(
    originalColors: ProductColor[], 
    currentColors: ProductColor[]
  ) {
    const changes = {
      added: [] as ProductColor[],
      updated: [] as ProductColor[],
      removed: [] as number[]
    };

    // Find original IDs for tracking removals
    const originalIds = new Set(originalColors.map(c => c._id));
    const currentIds = new Set(currentColors.map(c => c._id));

    // Detect removed colors
    changes.removed = originalColors
      .filter(color => !currentIds.has(color._id))
      .map(color => color._id);

    // Detect added and updated colors
    currentColors.forEach(currentColor => {
      const originalColor = originalColors.find(c => c._id === currentColor._id);
      
      if (!originalColor) {
        // New color
        changes.added.push(currentColor);
      } else if (!this.deepEqual(originalColor, currentColor)) {
        // Modified color
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
    const hasColorChanges = colorChanges.added.length > 0 || 
                           colorChanges.updated.length > 0 || 
                           colorChanges.removed.length > 0;

    return {
      formChanges,
      colorChanges,
      hasChanges: hasFormChanges || hasColorChanges
    };
  }
}