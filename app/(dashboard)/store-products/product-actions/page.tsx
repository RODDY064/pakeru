"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Editor from "@/app/ui/dashboard/editor";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormSchema,
  type ProductFormData,
} from "@/app/ui/dashboard/zodSchema";
import { compressImage } from "@/libs/imageCompression";
import { ProductVariant, ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import { CategoryType } from "@/store/category";
import Media from "@/app/ui/dashboard/media";
import Category from "@/app/ui/dashboard/categories";
import ColorStockAndSizes from "@/app/ui/dashboard/colorStockAndSize";
import ProductTags from "@/app/ui/dashboard/productTags";
import { mapVariantsToColors, ProductAPIService } from "./helpers";
import DeleteModal from "./deleletModal";

export type ProductImage = {
  id: number;
  url: string | ArrayBuffer;
  name: string;
  file?: File | Blob;
};

export type ProductColor = {
  id: number;
  name: string;
  color?: string;
  hex: string;
  images: ProductImage[];
  isActive?: boolean;
  stock: number;
  sizes: string[];
};

export default function ProductActions() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
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
      colors: [],
    },
  });

  const {
    selectedProduct,
    setSelectedProduct,
    loadStoreProduct,
    getCategoryNameById,
  } = useBoundStore();
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [submitError, setSubmitError] = useState<string>("");
  const [stocksError, setStocksError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeColorId, setActiveColorId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [editorValue, setEditorValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const productID = searchParams.get("productID");
  const productName = searchParams.get("productName");
  const isEditMode = Boolean(productID);

  const populateFormWithProduct = useCallback(
    (product: ProductData) => {
      console.log("🔧 Populating form with product:", product.id);

      setValue("name", product.name);
      setValue("description", product.description as string);
      setValue("price", product.price.toString());
      setValue("totalNumber", product.totalNumber.toString());
      setValue(
        "status",
        product.status as "active" | "inactive" | "out-of-stock" | "draft"
      );
      setValue("category", product.category);
      setValue("tags", product.tags as string[]);

      setEditorValue(product?.description as string);
      setTags(product.tags ?? ([] as string[]));
      setSelectedCategory(product.category);

      if (product.variants && product.variants.length > 0) {
        const mappedColors = mapVariantsToColors(product.variants);
        setColors(mappedColors);
        if (mappedColors.length > 0) {
          setActiveColorId(mappedColors[0].id);
        }
      }

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

    console.log("🚀 Starting product fetch for ID:", productID);
    setLoadingProduct(true);
    setProductLoadError(null);
    setIsInitialized(false);

    const loadProduct = async () => {
      try {
        // If we don't have the product or it's the wrong one, load it
        if (!selectedProduct?.id || selectedProduct.id !== productID) {
          console.log("📡 Loading product from store...");
          await loadStoreProduct(productID);
        } else {
          console.log("✅ Product already available:", selectedProduct.id);
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
    if (!productID || !selectedProduct?.id || isInitialized) {
      return;
    }

    if (selectedProduct.id === productID) {
      console.log("📦 Product loaded from store:", selectedProduct.id);
      populateFormWithProduct(selectedProduct);
      setLoadingProduct(false);
    }
  }, [selectedProduct, productID, isInitialized, populateFormWithProduct]);

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
    console.log(selectedProduct, "selected product");
  }, [selectedProduct]);

  useEffect(() => {
    setValue("colors", colors);
  }, [colors, setValue]);

  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  useEffect(() => {
    setValue("category", selectedCategory);
  }, [selectedCategory, setValue]);

  // const onSubmit = async (data: ProductFormData) => {
  //   setSubmitError("");
  //   setStocksError("");

  //   console.log(data,"data")

  //   // Validation
  //   if (colors.length === 0) {
  //     setSubmitError("Please add at least one color variant");
  //     return;
  //   }

  //   if (!data.price || isNaN(Number(data.price))) {
  //     setSubmitError("Please enter a valid price");
  //     return;
  //   }

  //   // Additional validation for colors and images
  //   const hasInsufficientImages = colors.some(
  //     (color) => color.images.length < 3
  //   );
  //   if (hasInsufficientImages) {
  //     setSubmitError("Each color must have at least 3 images");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     // Get environment variables
  //     const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  //     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  //     if (!token || !baseUrl) {
  //       throw new Error("Missing required environment variables");
  //     }

  //     // Choose upload method
  //     const useFileUpload = colors.some((c) =>
  //       c.images.some((img) => img.file instanceof File)
  //     );

  //     let response;
  //     let processedColors = [...colors]; // Copy for processing

  //     if (useFileUpload) {
  //       console.log("Compressing and preparing files...");
  //       let totalSize = 0;
  //       const apiFormData = new FormData();

  //       // Process and compress files first
  //       for (let ci = 0; ci < colors.length; ci++) {
  //         const color = colors[ci];
  //         for (let ii = 0; ii < color.images.length; ii++) {
  //           const img = color.images[ii];
  //           if (img.file && img.file instanceof File) {
  //             let fileToUpload = img.file;

  //             // Compress large files
  //             if (img.file.size > 1024 * 1024) {
  //               console.log(`Compressing ${img.file.name}...`);
  //               try {
  //                 fileToUpload = await compressImage(img.file, {
  //                   maxSizeMB: 1,
  //                 });
  //                 // Update the processed colors with compressed file info
  //                 processedColors[ci].images[ii] = {
  //                   ...img,
  //                   file: fileToUpload,
  //                   name: fileToUpload.name,
  //                 };
  //               } catch (compressionError) {
  //                 console.warn(
  //                   `Failed to compress ${img.file.name}:`,
  //                   compressionError
  //                 );
  //                 // Continue with original file if compression fails
  //               }
  //             }

  //             totalSize += fileToUpload.size;

  //             // Check if we're approaching size limit (45MB)
  //             if (totalSize > 45 * 1024 * 1024) {
  //               setSubmitError(
  //                 "Total file size too large. Please reduce image sizes or upload fewer images."
  //               );
  //               return;
  //             }
  //           }
  //         }
  //       }

  //       console.log(
  //         `Total upload size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`
  //       );

  //       // Basic form fields
  //       apiFormData.append("name", data.name);
  //       apiFormData.append("description", data.description);
  //       apiFormData.append("status", data.status);
  //       apiFormData.append(
  //         "price",
  //         String(
  //           typeof data.price === "string"
  //             ? parseFloat(data.price.replace(/[^\d.]/g, ""))
  //             : data.price
  //         )
  //       );
  //       apiFormData.append(
  //         "totalNumber",
  //         String(
  //           processedColors.reduce((total, c) => total + (c.stock || 0), 0) ||
  //             Number(data.totalNumber)
  //         )
  //       );
  //       apiFormData.append("category", data.category);

  //       (data.tags || []).forEach((tag) => {
  //         apiFormData.append("tags[]", tag);
  //       });

  //       // Transform variants to match your API structure
  //       const variants = processedColors.map((color) => ({
  //         color: color.name,
  //         colorHex: color.hex,
  //         sizes: color.sizes || [],
  //         stock: color.stock || 0,
  //         images: (color.images || []).map((img) => img.name),
  //       }));

  //       apiFormData.append("variants", JSON.stringify(variants));

  //       // Add files in order
  //       let fileIndex = 0;
  //       for (const color of processedColors) {
  //         for (const img of color.images) {
  //           if (img.file && img.file instanceof File) {
  //             // Use indexed naming to help server associate files with variants
  //             apiFormData.append(`images`, img.file);
  //             // Optionally add metadata to help server understand file relationships
  //             apiFormData.append(
  //               `fileMetadata[${fileIndex}]`,
  //               JSON.stringify({
  //                 colorName: color.name,
  //                 originalName: img.name,
  //               })
  //             );
  //             fileIndex++;
  //           }
  //         }
  //       }

  //       // ---- FormData Upload (with files) ----
  //       response = await fetch(`${baseUrl}/products`, {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           // "ngrok-skip-browser-warning": "true",
  //         },
  //         body: apiFormData,
  //       });
  //     }

  //     console.log("Response status:", response?.status);

  //     if (!response?.ok) {
  //       const errorData = await response?.text();
  //       console.error("API Error:", errorData);

  //       // Try to parse error message from response
  //       let errorMessage = `HTTP error! status: ${response?.status}`;
  //       try {
  //         const parsedError = JSON.parse(errorData ?? "{}");
  //         errorMessage =
  //           parsedError.message || parsedError.error || errorMessage;
  //       } catch {
  //         // If not JSON, use raw text
  //         errorMessage = errorData || errorMessage;
  //       }

  //       throw new Error(errorMessage);
  //     }

  //     const result = await response.json();
  //     console.log("Product created successfully:", result);
  //     router.push("/store-products");

  //     // Success - redirect or show success message
  //     // You can add success notification here
  //     // toast.success("Product created successfully!");

  //     // Optional: Reset form or redirect

  //     // Optional: Reset form state
  //     // setColors([]);
  //     // reset(); // If using react-hook-form
  //   } catch (error) {
  //     console.error("Submission error:", error);

  //     if (error instanceof Error) {
  //       setSubmitError(`Failed to create product: ${error.message}`);
  //     } else {
  //       setSubmitError("Failed to create product: An unknown error occurred");
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const validateForm = (data: ProductFormData): string | null => {
    if (colors.length === 0) {
      return "Please add at least one color variant";
    }

    if (!data.price || isNaN(Number(data.price))) {
      return "Please enter a valid price";
    }

    const hasInsufficientImages = colors.some(
      (color) => color.images.length < 3
    );
    if (hasInsufficientImages) {
      return "Each color must have at least 3 images";
    }

    return null;
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitError("");
    setStocksError("");

    console.log(data, "data");

    // Validate form
    const validationError = validateForm(data);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && productID) {
        // Update existing product
        const result = await ProductAPIService.updateProduct(
          productID,
          data,
          colors
        );
        console.log("Product updated successfully:", result);
      } else {
        // Create new product
        const result = await ProductAPIService.createProduct(data, colors);
        console.log("Product created successfully:", result);
      }

      // Success - redirect
      router.push("/store-products");
    } catch (error) {
      console.error("Submission error:", error);

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
    }
  };

  const handelBack = () => {
    setSelectedProduct(null);
    router.push("/store-products");
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);
  useEffect(() => {
    console.log(colors, "colors");
  }, [colors]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-4 xl:px-8  xl:ml-[15%]  pt-24 pb-32">
          <div className="w-[98%] lg:w-[90%] flex items-center gap-1 md:gap-4">
            <div onClick={handelBack}>
              <Image
                src="/icons/arrow.svg"
                width={20}
                height={20}
                alt="arrow"
                className="rotate-90 cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center w-full ">
              <p className="font-avenir text-xl sm:text-2xl font-bold mt-[5px] ">
                {productID ? productName : " Add Product"}
              </p>
              {productID && (
                <div className="flex gap-4 items-center">
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-black border flex items-center gap-2 cursor-pointer rounded-lg">
                    <p className="font-avenir text-sm font-[500] text-white ">
                      Update <span className="hidden sm:inline-flex">product</span>
                    </p>
                  </div>
                  <div
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="px-3 sm:px-3 py-1.5 sm:py-2 bg-red-100 border border-red-500 flex items-center gap-2 cursor-pointer rounded-lg">
                    <p className="font-avenir text-sm font-[500] text-red-500 ">
                      Delete <span className="hidden sm:inline-flex">product</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* {submitError && (
          <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-avenir">{submitError}</p>
          </div>
        )} */}

          {!loadingProduct ? (
            <div className="w-full flex gap-4 mt-4 h-full  sm:flex-row flex-col items-stretch">
              <div className="flex-1   sm:w-[60%] md:w-[70%] relative ">
                <div className="flex items-stretch flex-col h-full ">
                  <div className="w-full min-h-[300px] bg-white border border-black/20 rounded-[35px] inline-block self-start p-4 sm:p-6 pb-10">
                    <div>
                      <p className="font-avenir font-[500] text-lg md:text-xl ">
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
                      <p className="font-avenir font-[500] text-lg ">
                        Descritpion
                      </p>
                      <div className="mt-2">
                        <Editor
                          value={editorValue}
                          onChange={(content: string) =>
                            setValue("description", content)
                          }
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Media
                    setColors={setColors}
                    colors={colors}
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                  />
                  <div className="flex-1  min-h-30  mt-4 bg-white border border-black/20 rounded-[32px] ">
                    <div className="h-auto flex-1 flex p-4 md:p-6 pb-10 gap-4 md:gap-10 flex-col md:flex-row">
                      <div className="px-2 flex-1">
                        <p className="font-avenir font-[500] text-lg ">
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
                        <p className="font-avenir font-[500] text-lg ">
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
                </div>
              </div>
              <div className="w-full h-full sm:w-[40%] md:w-[30%] flex flex-col gap-4">
                <div className="w-full min-h-[140px] bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-6  ">
                  <div>
                    <p className="font-avenir font-[500] text-lg ">Status</p>
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
                <div className="w-full min-h-[300px] bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-6 ">
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
                  <p className="text-sm pb-2  text-black/50 font-avenir">
                    Stock and sizes for selected color
                  </p>
                  <div className="w-full pb-4 grid grid-cols-3 gap-2 ">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => setActiveColorId(color.id)}
                        className={`flex  justify-between gap-2 px-1 sm:px-3  cursor-pointer py-0.5 sm:py-1 rounded-[24px]
                  ${
                    activeColorId === color.id
                      ? "bg-black/20 border border-black/20"
                      : "bg-black/2 border border-black/10"
                  }`}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            style={{ backgroundColor: color.hex }}
                            className="size-4.5 border border-black/30  rounded-full "
                          ></div>
                          <p className="font-avenir uppercase pt-1 sm:pt-[0.4px] text-[11px] sm:text-sm">
                            {color.name}
                          </p>
                        </div>
                        <div className="flex items-centern gap-1"></div>
                      </div>
                    ))}
                  </div>

                  {activeColorId &&
                  colors.find((c) => c.id === activeColorId) ? (
                    <ColorStockAndSizes
                      colors={colors}
                      setColors={setColors}
                      activeColorId={activeColorId}
                    />
                  ) : (
                    <div className="text-center py-8 h-full">
                      <p className="text-black/50 font-avenir">
                        {colors.length === 0
                          ? "Add a color first"
                          : "Select a color to manage stock and sizes"}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  typeof="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full p-4 md:p-6  md:h-35 rounded-2xl md:rounded-[26px]  cursor-pointer flex items-center justify-center bg-black"
                >
                  <p className="text-white font-avenir font-black text-xl md:text-4xl">
                    {/* {productID
                    ? "Save"
                    : isSubmitting
                    ? "Publishing..."
                    : "Publish"} */}

                    {isSubmitting ? "Publishing..." : "Publish"}
                  </p>
                </button>
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
        productID={productID || ''}
        productName={productName || ''}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

