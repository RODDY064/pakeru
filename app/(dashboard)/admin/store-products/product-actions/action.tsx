"use client";

export const revalidate = 0; 
export const dynamic = "force-dynamic";



import React, {
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormSchema,
  type ProductFormData,
} from "@/app/ui/dashboard/zodSchema";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Media from "@/app/ui/dashboard/media";
import Category from "@/app/ui/dashboard/categories";
import ColorStockAndSizes from "@/app/ui/dashboard/colorStockAndSize";
import ProductTags from "@/app/ui/dashboard/productTags";
import { mapVariantsToColors, ProductAPIService } from "./helpers";
import DeleteModal from "./deleletModal";
import { useApiClient } from "@/libs/useApiClient";
import SizeType from "@/app/ui/dashboard/sizeType";
import Instructions from "@/app/ui/dashboard/instructions";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import { stripHtml } from "@/app/ui/ExpandableDescription";
import { ProductChangeDetector } from "./changeDetector";


export type ProductImage = {
  _id: string;
  url: string | ArrayBuffer;
  publicId?:string,
  name: string;
  file?: File | Blob;
};

export type ProductColor = {
  _id: string;
  name: string;
  color?: string;
  hex: string;
  images: ProductImage[];
  isActive?: boolean;
  stock: number;
  sizes: string[];
};

// Core component with search params usage
function ProductActionsContent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    getValues,
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      totalNumber: "",
      status: "active",
      category: "",
      tags: [],
      variants: [],
      sizeType: {
        gender: "",
        clothType: "",
      },
      washInstructions: [],
    },
  });

  const {
    selectedProduct,
    setSelectedProduct,
    loadStoreProduct,
    getCategoryNameById,
    clothTypes
  } = useBoundStore();

  const { patch, post } = useApiClient();

  const [variants, setVariants] = useState<ProductColor[]>([]);
  const [submitError, setSubmitError] = useState<string>("");
  const [stocksError, setStocksError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeColorId, setActiveColorId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [editorValue, setEditorValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<ProductFormData | null>(
    null
  );
  const [originalColors, setOriginalColors] = useState<ProductColor[] | null>(
    null
  );
  const [aboutToSubmit, setAboutToSubmit] = useState(false);

  const [instruction, setInstruction] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);

  const handleAddInstruction = () => {
    if (instruction.trim()) {
      setInstructions([...instructions, instruction.trim()]);
      setInstruction(""); // reset input
    }
  };

  const productID = searchParams.get("productID");
  const productName = searchParams.get("productName");
  const isEditMode = Boolean(productID);

  const populateFormWithProduct = useCallback(
    (product: ProductData) => {
    

      const formData: ProductFormData = {
        name: product.name,
        description: product.description as string,
        price: product.price.toString(),
        totalNumber: product.totalNumber.toString(),
        status: product.status as | "active" | "inactive" | "out-of-stock"| "draft",
        category: product.category,
        tags: product.tags as string[],
        variants: [],
        productCare: product.productCare ?? "",
        washInstructions: product.washInstructions ?? [],
        sizeType: {
          gender: product?.sizeType?.gender ?? "",
          clothType: product?.sizeType?.clothType?._id ?? "",
        } as {
          gender: "" | "male" | "female";
          clothType: string;
        },
      };

      // Set form values
      setValue("name", formData.name);
      setValue("description", stripHtml(formData.description));
      setValue("price", formData.price);
      setValue("totalNumber", formData.totalNumber);
      setValue("status", formData.status);
      setValue("category", formData.category);
      setValue("tags", formData.tags);
      setValue("productCare", formData.productCare);
      setValue("washInstructions", formData.washInstructions);
      setValue("sizeType.gender", formData.sizeType.gender);
      setValue("sizeType.clothType", formData.sizeType.clothType);

      setEditorValue(stripHtml(formData.description));
      setTags(formData.tags ?? []);
      setSelectedCategory(formData.category);
      setInstructions(formData.washInstructions ?? []);

      if (product.variants && product.variants.length > 0) {
        const mappedColors = mapVariantsToColors(product.variants);
        setVariants(mappedColors);
        if (mappedColors.length > 0) {
          setActiveColorId(mappedColors[0]._id);
        }
        // Store original colors for comparison
        setOriginalColors(mappedColors);
      }

      // Store original form data for comparison
      setOriginalData(formData);
      setIsInitialized(true);
    },
    [setValue]
  );

  // productID exist fetch product
  useEffect(() => {
    if (!productID) {
      console.log("❌ No productID provided");
      return;
    }

    // console.log("🚀 Starting product fetch for ID:", productID);
    setLoadingProduct(true);
    setProductLoadError(null);
    setIsInitialized(false);

    const loadProduct = async () => {
      try {
        // If we don't have the product or it's the wrong one, load it
        if (!selectedProduct?._id || selectedProduct._id !== productID) {
          console.log("📡 Loading product from store...");
          await loadStoreProduct(productID);
        } else {
          populateFormWithProduct(selectedProduct);
          setLoadingProduct(false);
        }
      } catch (error) {
        console.error("💥 Error loading product:", error);
        setProductLoadError(
          error instanceof Error ? error.message : "Failed to load product"
        );
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productID, loadStoreProduct]);

  useEffect(() => {
    if (!productID || !selectedProduct?._id || isInitialized) {
      return;
    }

    if (selectedProduct._id === productID) {
      populateFormWithProduct(selectedProduct);
      setLoadingProduct(false);
    }
  }, [selectedProduct, productID, isInitialized, populateFormWithProduct,clothTypes]);
 
  useEffect(() => {
    if (!productID || !loadingProduct) return;

    const timeoutId = setTimeout(() => {
      if (loadingProduct && !isInitialized) {
        setProductLoadError("Product loading timeout - please try again");
        setLoadingProduct(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [productID, loadingProduct, isInitialized]);

  // Effect 4: Reset state when productID changes
  useEffect(() => {
    setIsInitialized(false);
    setProductLoadError(null);
  }, [productID]);

  // Watch form values for real-time updates
  const watchedValues = watch();

  useEffect(() => {
    setValue("washInstructions", instructions);
  }, [instructions, setValue]);

  useEffect(() => {
    setValue("variants", variants);
  }, [variants, setValue]);

  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  useEffect(() => {
    setValue("category", selectedCategory);
  }, [selectedCategory, setValue]);

 const validateProductForm = (
  data: ProductFormData,
  variants: ProductColor[]
): { isValid: boolean; error: string | null } => {
  // Validate basic required fields
  if (!data.name || data.name.trim().length < 3) {
    return {
      isValid: false,
      error: "Product name must be at least 3 characters",
    };
  }

  if (!data.description || data.description.trim().length < 10) {
    return {
      isValid: false,
      error: "Description must be at least 10 characters",
    };
  }

  if (!data.category || data.category.trim().length === 0) {
    return {
      isValid: false,
      error: "Please select a category",
    };
  }

  // Validate price
  if (!data.price || data.price.trim().length === 0) {
    return {
      isValid: false,
      error: "Please enter a price",
    };
  }

  const priceNum = parseFloat(String(data.price).replace(/[^\d.]/g, ""));
  if (isNaN(priceNum) || priceNum <= 0) {
    return {
      isValid: false,
      error: "Please enter a valid price greater than 0",
    };
  }

  // Validate total number/stock
  if (!data.totalNumber || data.totalNumber.trim().length === 0) {
    return {
      isValid: false,
      error: "Please enter total stock number",
    };
  }

  const totalNum = parseInt(String(data.totalNumber));
  if (isNaN(totalNum) || totalNum <= 0) {
    return {
      isValid: false,
      error: "Total stock must be a positive number",
    };
  }

  // Validate status
  const validStatuses = ["active", "inactive", "out-of-stock", "draft"];
  if (!data.status || !validStatuses.includes(data.status)) {
    return {
      isValid: false,
      error: "Please select a valid product status",
    };
  }

  // Validate tags
  if (!data.tags || data.tags.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one tag",
    };
  }

  const validTags = data.tags.filter((tag) => tag && tag.trim().length > 0);
  if (validTags.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one valid tag",
    };
  }

  // Validate product care
  if (!data.productCare || data.productCare.trim().length < 5) {
    return {
      isValid: false,
      error: "Product care information must be at least 5 characters",
    };
  }

  // Validate wash instructions
  if (!data.washInstructions || data.washInstructions.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one wash instruction",
    };
  }

  const validInstructions = data.washInstructions.filter(
    (instruction) => instruction && instruction.trim().length > 0
  );
  if (validInstructions.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one valid wash instruction",
    };
  }

  // Validate size type
  if (!data.sizeType || !data.sizeType.gender || !data.sizeType.clothType) {
    return {
      isValid: false,
      error: "Please select both gender and cloth type",
    };
  }

  // Validate variants/colors
  if (!variants || variants.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one color variant",
    };
  }

  // Validate each variant
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const variantLabel = variant.name || `Variant ${i + 1}`;

    // Check color name
    if (!variant.name || variant.name.trim().length === 0) {
      return {
        isValid: false,
        error: `${variantLabel}: Color name is required`,
      };
    }

    // Check hex color
    if (!variant.hex || !/^#[0-9A-F]{6}$/i.test(variant.hex)) {
      return {
        isValid: false,
        error: `${variantLabel}: Invalid color hex code`,
      };
    }

    // Check stock
    if (variant.stock === undefined || variant.stock === null) {
      return {
        isValid: false,
        error: `${variantLabel}: Stock quantity is required`,
      };
    }

    if (variant.stock < 0) {
      return {
        isValid: false,
        error: `${variantLabel}: Stock cannot be negative`,
      };
    }

    // Check sizes
    if (!variant.sizes || variant.sizes.length === 0) {
      return {
        isValid: false,
        error: `${variantLabel}: At least one size is required`,
      };
    }

    const validSizes = variant.sizes.filter((size) => size && size.trim().length > 0);
    if (validSizes.length === 0) {
      return {
        isValid: false,
        error: `${variantLabel}: At least one valid size is required`,
      };
    }

    // Check images
    if (!variant.images || variant.images.length < 3) {
      return {
        isValid: false,
        error: `${variantLabel}: At least 3 images are required`,
      };
    }

    if (variant.images.length > 5) {
      return {
        isValid: false,
        error: `${variantLabel}: Maximum 5 images allowed`,
      };
    }

    // Validate each image
    for (let j = 0; j < variant.images.length; j++) {
      const image = variant.images[j];
      
      if (!image.name || image.name.trim().length === 0) {
        return {
          isValid: false,
          error: `${variantLabel}: Image ${j + 1} is missing a name`,
        };
      }

      // If it's a new file upload, validate it
      if (image.file instanceof File || image.file instanceof Blob) {
        const file = image.file;
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if (!ALLOWED_TYPES.includes(file.type)) {
          return {
            isValid: false,
            error: `${variantLabel}: Image ${j + 1} must be JPEG, PNG, or WebP`,
          };
        }

        if (file.size > MAX_SIZE) {
          return {
            isValid: false,
            error: `${variantLabel}: Image ${j + 1} exceeds 10MB limit`,
          };
        }
      } else if (!image.url) {
        // If not a file, must have a URL
        return {
          isValid: false,
          error: `${variantLabel}: Image ${j + 1} is missing URL or file`,
        };
      }
    }
  }

  // Validate total stock across variants
  const totalVariantStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  if (totalVariantStock > totalNum) {
    return {
      isValid: false,
      error: `Total variant stock (${totalVariantStock}) exceeds declared total (${totalNum})`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

 
  const onSubmit = async (data: ProductFormData) => {
  setSubmitError("");
  setStocksError("");
  console.log(data);

  // Validate form
  const validationError = validateProductForm(data, variants);
  if (!validationError.isValid) {
    setSubmitError(validationError.error ?? "");
    return;
  }

  setIsSubmitting(true);

  try {
    if (isEditMode && productID && originalData && originalColors) {
    
      const changes = ProductChangeDetector.detectChanges(
        originalData,
        originalColors,
        data,
        variants
      );

      // Check if there are any changes
      if (!changes.hasChanges) {
        setSubmitError("No changes detected to save");
        setIsSubmitting(false);
        setAboutToSubmit(false);
        return;
      }

      // Extract removed variant IDs
      const removedIds = changes.colorChanges.removed.map(v => v._id);

      // Update existing product with removed IDs as query param
      const result = await ProductAPIService.updateProduct(
        productID,
        data,
        variants,
        originalData,
        originalColors,
        patch,
        removedIds // Pass removed IDs
      );

      if (result.message === "No changes to save") {
        setSubmitError("No changes detected to save");
        setIsSubmitting(false);
        setAboutToSubmit(false);
        return;
      }

      console.log("✅ Product updated successfully");
      
      if (removedIds.length > 0) {
        console.log(`🗑️ Removed ${removedIds.length} variant(s):`, removedIds);
      }
    } else {
      // Create new product - send all data
      const result = await ProductAPIService.createProduct(
        data,
        variants,
        post
      );

      console.log("✅ Product created successfully");
    }

    router.push("/admin/store-products");
  } catch (error) {
    console.error("💥 Submission error:", error);
    if (error instanceof Error) {
      setSubmitError(
        `Failed to ${isEditMode ? "update" : "create"} product: ${
          error.message
        }`
      );
    } else {
      setSubmitError(
        `Failed to ${
          isEditMode ? "update" : "create"
        } product: An unknown error occurred`
      );
    }
  } finally {
    setIsSubmitting(false);
    setAboutToSubmit(false);
  }
};


  useEffect(() => {
    if (variants) {
      const totalStock = variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );

      if (totalStock > 0) {
        setValue("totalNumber", String(totalStock));
      }
    }
  }, [variants, setValue, watch]);

  useEffect(() => {
    console.log(aboutToSubmit);
  }, [aboutToSubmit]);

  const handelBack = () => {
    setSelectedProduct(null);
    router.push("/admin/store-products");
  };

  useEffect(() => {
    if (!isEditMode) {
      setOriginalData(null);
      setOriginalColors(null);
    }
  }, [isEditMode, productID]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-4 xl:px-8 xl:ml-[15%] pt-4 pb-32">
          <div className="w-full flex items-center gap-1 md:gap-4">
            <div onClick={handelBack}>
              <Image
                src="/icons/arrow.svg"
                width={20}
                height={20}
                alt="arrow"
                className="rotate-90 cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center w-full">
              <div>
                {productID ? (
                  <div className="flex items-center gap-3">
                    <p className="font-avenir text-xl sm:text-2xl font-bold mt-[5px]">
                      {productName}
                    </p>
                    {selectedProduct?._id && (
                      <StatusBadge
                        status={selectedProduct?.status as string}
                        statuses={[
                          "active",
                          "inactive",
                          "out-of-stock",
                          "draft",
                        ]}
                      />
                    )}
                  </div>
                ) : (
                  <p className="font-avenir text-xl sm:text-2xl font-bold mt-[5px]">
                    Add Product
                  </p>
                )}
              </div>
              {productID && (
                <div className="flex gap-4 items-center sm:w-[40%] md:w-[30%]">
                  <div
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="px-3 sm:px-3 py-1.5 sm:py-2 bg-red-100 border border-red-500 flex items-center gap-2 cursor-pointer rounded-lg"
                  >
                    <p className="font-avenir text-sm font-[500] text-red-500">
                      Delete{" "}
                      <span className="hidden sm:inline-flex">product</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!loadingProduct ? (
            <div className="w-full flex gap-4 mt-4 h-full sm:flex-row flex-col items-stretch">
              <div className="fle sm:w-[60%] md:w-[65%] relative flex-none ">
                <div className="flex items-stretch flex-col h-full">
                  <div className="w-full min-h-[300px] bg-white border border-black/20 rounded-[35px] inline-block self-start p-4 sm:p-6 pb-10">
                    <div>
                      <p className="font-avenir font-[500] text-lg md:text-xl">
                        Name
                      </p>
                      <input
                        {...register("name", {
                          required: "Product name is required",
                        })}
                        placeholder="Sheet Sleeve Hoodie"
                        className="w-full border placeholder:text-black/30 border-black/10 bg-black/5 rounded-lg mt-2 h-11 p-2 focus:outline-none focus-within:border-black/30"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="font-avenir font-[500] text-lg">
                        Description
                      </p>
                      <div className="">
                        <textarea  
                        {...register("description")}
                        placeholder="start typing the product description"
                        className="w-full border min-h-[150px] font-avenir  placeholder:text-black/30 border-black/10 bg-black/5 rounded-2xl mt-2 h-11 p-4 focus:outline-none focus-within:border-black/30"></textarea>
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Media
                    setVariants={setVariants}
                    variants={variants}
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                    aboutToSubmit={aboutToSubmit}
                  />

                  <div className="min-h-36 mt-4 bg-white border border-black/20 rounded-[32px]">
                    <div className="h-auto flex-1 flex p-4 md:p-6 pb-10 gap-4 md:gap-10 flex-col md:flex-row">
                      <div className="px-2 flex-1">
                        <p className="font-avenir font-[500] text-lg">
                          Product Price
                        </p>
                        <input
                          {...register("price")}
                          placeholder="GHS 125"
                          className="focus:outline-none w-full h-12 border border-black/20 rounded-2xl p-3 mt-2 focus-within:border-black/50"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.price.message}
                          </p>
                        )}
                      </div>
                      <div className="px-2 flex-1">
                        <p className="font-avenir font-[500] text-lg">
                          Product Total Number
                        </p>
                        <input
                          {...register("totalNumber")}
                          placeholder="1000"
                          className="focus:outline-none w-full h-12 border border-black/20 rounded-2xl p-3 mt-2 focus-within:border-black/50"
                        />
                        {errors.totalNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.totalNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Instructions
                    errors={errors}
                    register={register}
                    onAddInstruction={handleAddInstruction}
                    instructionInput={instruction}
                    instructions={instructions}
                    onInstructionInputChange={setInstruction}
                    onRemoveInstruction={(idx) =>
                      setInstructions(instructions.filter((_, i) => i !== idx))
                    }
                  />
                </div>
              </div>

              <div className=" flex-1 sm:w-[40%]  md:w-[35%]  ">
                <div className="flex items-stretch flex-col h-full  gap-4">
                  <div className="w-full h-[140px] bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-6">
                    <div>
                      <p className="font-avenir font-[500] text-lg">Status</p>
                      <div className="relative mt-2 flex items-center">
                        <select
                          {...register("status")}
                          className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                        <div className="absolute right-3">
                          <Image
                            src="/icons/arrow.svg"
                            width={16}
                            height={16}
                            alt="arrow"
                          />
                        </div>
                        {errors.status && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.status.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full min-h-[300px] bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-6">
                    <Category
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                    <ProductTags tags={tags} setTags={setTags} />
                    {errors.tags && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tags.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full min-h-[350px] bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-4 relative overflow-hidden">
                    <p className="text-sm pb-2 text-black/50 font-avenir">
                      Stock and sizes for selected color
                    </p>
                    <div className="w-full pb-4 flex flex-wrap gap-2">
                      {variants.map((color) => (
                        <div
                          key={color._id}
                          onClick={() => setActiveColorId(color._id)}
                          className={`flex justify-between gap-2 px-1 sm:px-3 cursor-pointer py-0.5 sm:py-1 rounded-[24px]
                        ${
                          activeColorId === color._id
                            ? "bg-black/20 border border-black/20"
                            : "bg-black/2 border border-black/10"
                        }`}
                        >
                          <div className="flex  items-center gap-1">
                            <div
                              style={{ backgroundColor: color.hex }}
                              className="size-4.5 border border-black/30 rounded-full"
                            ></div>
                            <p className="font-avenir text-nowrap uppercase pt-1 sm:pt-[0.4px] text-[11px] sm:text-sm">
                              {color.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1"></div>
                        </div>
                      ))}
                    </div>

                    {activeColorId &&
                    variants.find((c) => c._id === activeColorId) ? (
                      <ColorStockAndSizes
                        colors={variants}
                        setColors={setVariants}
                        activeColorId={activeColorId}
                        aboutToSubmit={aboutToSubmit}
                      />
                    ) : (
                      <div className="text-center py-8 h-full flex flex-col justify-between">
                        <p className="text-black/50 font-avenir">
                          {variants.length === 0
                            ? "Add a color first"
                            : "Select a color to manage stock and sizes"}
                        </p>
                        {aboutToSubmit && variants.length === 0 && (
                          <p className="pb-3 font-avenir text-red-500">
                            No variant's added
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <SizeType
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => setAboutToSubmit(true)}
                    className="mt-2 w-full p-4 md:p-6 md:h-35 rounded-2xl md:rounded-[26px] cursor-pointer flex items-center justify-center bg-black"
                  >
                    <p className="text-white font-avenir font-black text-xl md:text-4xl">
                      {productID
                        ? isSubmitting
                          ? "Saving..."
                          : "Save"
                        : isSubmitting
                        ? "Publishing..."
                        : "Publish"}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {productLoadError ? (
                <div className="flex gap-2 items-center flex-col mt-36">
                  <p className="text-nowrap font-avenir text-xl text-red-500">
                    {productLoadError}
                  </p>
                  <p
                    onClick={() => {
                      if (productID) {
                        loadStoreProduct(productID);
                      }
                    }}
                    className="mt-6 px-6 font-avenir py-2 rounded-md bg-black text-white cursor-pointer"
                  >
                    Refresh to load
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center mt-36">
                  <div className="flex gap-2 items-center">
                    <Image
                      src="/icons/loader.svg"
                      width={30}
                      height={30}
                      alt="loader"
                    />
                    <p className="text-nowrap font-avenir text-xl text-black/50">
                      Loading product
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </form>

      {showDeleteConfirm && (
        <DeleteModal
          productID={productID || ""}
          productName={productName || ""}
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

// Main component with Suspense boundary
export default function ProductActions() {
  return (
    <Suspense
      fallback={
        <div className="px-4 xl:px-8 xl:ml-[15%] pt-24 pb-32">
          <div className="flex flex-col items-center mt-36">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/loader.svg"
                width={30}
                height={30}
                alt="loader"
              />
              <p className="text-nowrap font-avenir text-xl text-black/50">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <ProductActionsContent />
    </Suspense>
  );
}
