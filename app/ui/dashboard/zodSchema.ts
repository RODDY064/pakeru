import { z } from "zod";

// Image schema
const ProductImageSchema = z.object({
  id: z.number(),
  url: z.union([z.string(), z.instanceof(ArrayBuffer)]),
  name: z.string(),
  file: z.instanceof(File).optional(),
});

// Updated Color/Variant schema with stock and sizes per color
const ProductColorSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Color name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  hex: z.string().regex(/^[0-9A-F]{6}$/i, "Must be a valid hex value"),
  images: z.array(ProductImageSchema)
    .min(3, "Each color must have at least 3 images")
    .max(5, "Each color can have maximum 5 images"),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  sizes: z.array(z.string().min(1)).min(1, "Each color must have at least one size"),
  isActive: z.boolean().optional(),
});

// Updated main product form schema
export const ProductFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required").refine((val) => {
    const num = parseFloat(val.replace(/[^\d.]/g, ''));
    return !isNaN(num) && num > 0;
  }, "Price must be a valid positive number"),
  totalNumber: z.string().min(1, "Total number is required").refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, "Total number must be a positive integer"),
  status: z.enum(["active", "inactive", "out-of-stock"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be active, inactive, or out-of-stock",
  }),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
  colors: z.array(ProductColorSchema).min(1, "At least one color variant is required"),
}).refine((data) => {
  // Custom validation: ensure total stock matches sum of color stocks
  const totalColorStock = data.colors.reduce((sum, color) => sum + color.stock, 0);
  const declaredTotal = parseInt(data.totalNumber);
  return totalColorStock <= declaredTotal;
}, {
  message: "Total stock across all colors cannot exceed the declared total number",
  path: ["totalNumber"]
});



// Infer TypeScript types from schema
export type ProductFormData = z.infer<typeof ProductFormSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductColor = z.infer<typeof ProductColorSchema>;

// Validation helper functions
export const validateProductForm = (data: unknown) => {
  return ProductFormSchema.safeParse(data);
};

// Custom validation for file uploads
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG files are allowed' };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

// Helper function to validate color stock and sizes
export const validateColorVariants = (colors: ProductColor[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  colors.forEach((color, index) => {
    if (color.stock < 0) {
      errors.push(`Color "${color.name}": Stock cannot be negative`);
    }
    
    if (color.sizes.length === 0) {
      errors.push(`Color "${color.name}": Must have at least one size`);
    }
    
    if (color.images.length < 3) {
      errors.push(`Color "${color.name}": Must have at least 3 images`);
    }
    
    if (color.images.length > 5) {
      errors.push(`Color "${color.name}": Cannot have more than 5 images`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Transform form data for API submission
export const transformFormData = (formData: ProductFormData) => {
  return {
    ...formData,
    price: parseFloat(formData.price.replace(/[^\d.]/g, '')),
    totalNumber: parseInt(formData.totalNumber),
    totalStock: formData.colors.reduce((sum, color) => sum + color.stock, 0),
    colors: formData.colors.map(color => ({
      ...color,
      images: color.images.map(img => ({
        ...img,
        url: typeof img.url === 'string' ? img.url : '',
      }))
    }))
  };
};

// product summary
export const getProductSummary = (colors: ProductColor[]) => {
  const totalStock = colors.reduce((sum, color) => sum + color.stock, 0);
  const totalImages = colors.reduce((sum, color) => sum + color.images.length, 0);
  const allSizes = [...new Set(colors.flatMap(color => color.sizes))];
  
  return {
    totalColors: colors.length,
    totalStock,
    totalImages,
    uniqueSizes: allSizes.length,
    allAvailableSizes: allSizes,
    readyForPublish: colors.every(color => 
      color.images.length >= 3 && 
      color.sizes.length > 0 && 
      color.stock >= 0
    )
  };
};