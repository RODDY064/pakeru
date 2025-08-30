"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Editor from "@/app/ui/dashboard/editor";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormSchema,
  type ProductFormData,
} from "@/app/ui/dashboard/zodSchema";

type ProductImage = {
  id: number;
  url: string | ArrayBuffer;
  name: string;
  file?: File;
};

type ProductColor = {
  id: number;
  name: string;
  color: string;
  hex: string;
  images: ProductImage[];
  isActive?: boolean;
  stock: number;
  sizes: string[];
};

export default function CreateProduct() {
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

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [submitError, setSubmitError] = useState<string>("");
  const [stocksError, setStocksError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "T-Shirt",
    "Hoodie",
    "Shorts",
    "Pants",
    "Accessories",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeColorId, setActiveColorId] = useState<number | null>(null);

  //   // Watch form values for real-time updates
  const watchedValues = watch();

  useEffect(() => {
    setValue("colors", colors);
  }, [colors, setValue]);

  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  useEffect(() => {
    setValue("category", selectedCategory);
  }, [selectedCategory, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitError("");
    setStocksError("")
    setIsSubmitting(true);

    try {
      // Additional validation for colors and images
      if (colors.length === 0) {
        setSubmitError("Please add at least one color variant");
        return;
      }

      const hasInsufficientImages = colors.some(
        (color) => color.images.length < 3
      );
      if (hasInsufficientImages) {
        setSubmitError("Each color must have at least 3 images");
        return;
      }

      // Transform data for API
      const transformedData = {
        ...data,
        price: parseFloat(data.price.replace(/[^\d.]/g, "")),
        totalNumber: parseInt(data.totalNumber),
        colors: colors.map((color) => ({
          ...color,
          images: color.images.map((img) => ({
            ...img,
            // Convert file to base64 or handle upload
            url: typeof img.url === "string" ? img.url : "",
          })),
        })),
        // Calculate total stock from all colors
        totalStock: colors.reduce((total, color) => total + color.stock, 0),
      };

      console.log("Submitting product:", transformedData);

      // Here you would typically send to your API
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(transformedData)
      // });

      // Success - redirect
      // router.push("/store-products");
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="px-4 xl:px-8  xl:ml-[15%]  pt-24 pb-32">
        <div className="w-[98%] lg:w-[90%] flex items-center gap-1 md:gap-4">
          <div onClick={() => router.push("/store-products")}>
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
              Add Product
            </p>
            {/* <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-black flex items-center gap-2 cursor-pointer rounded-lg">
            <p className="font-avenir text-sm font-[500] text-white ">
              Publish product
            </p>
           
          </div> */}
          </div>
        </div>

        {/* {submitError && (
          <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-avenir">{submitError}</p>
          </div>
        )} */}

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
                <p className="font-avenir font-[500] text-lg ">Descritpion</p>
                <div className="mt-2">
                  <Editor
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
                categories={categories}
                setCategories={setCategories}
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
                        style={{ backgroundColor: color.color }}
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

              {activeColorId && colors.find((c) => c.id === activeColorId) ? (
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
              className="mt-2 w-full p-4 md:p-6  md:h-35 rounded-2xl md:rounded-[26px]  cursor-pointer flex items-center justify-center bg-black">
              <p className="text-white font-avenir font-black text-xl md:text-4xl">
                {isSubmitting ? "Publishing..." : "Publish"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

const Media = ({
  colors,
  setColors,
  activeColorId,
  setActiveColorId,
}: {
  colors: ProductColor[];
  setColors: React.Dispatch<React.SetStateAction<ProductColor[]>>;
  activeColorId: number | null;
  submitError?:string
  setActiveColorId: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [newColor, setNewColor] = useState({
    name: "",
    color: "#000000",
    hex: "000000",
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const MIN_IMAGES = 3;
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

  // Get active color
  const activeColor = colors.find((color) => color.id === activeColorId);
  const canAddImages = activeColor && activeColor.images.length < MAX_IMAGES;
  const needsMoreImages = activeColor && activeColor.images.length < MIN_IMAGES;

  // Color management
  const handleColorChange = useCallback((colorValue: string) => {
    setNewColor((prev) => ({
      ...prev,
      color: colorValue,
      hex: colorValue.replace("#", ""),
    }));
  }, []);

  const handleHexChange = useCallback((hexValue: string) => {
    const cleanHex = hexValue.replace("#", "").toUpperCase();
    if (/^[0-9A-F]{0,6}$/i.test(cleanHex)) {
      const fullHex = `#${cleanHex.padEnd(6, "0")}`;
      setNewColor((prev) => ({
        ...prev,
        color: cleanHex.length === 6 ? fullHex : prev.color,
        hex: cleanHex,
      }));
    }
  }, []);

  const addColor = useCallback(() => {
    if (!newColor.name.trim()) {
      setUploadError("Color name is required");
      return;
    }

    if (
      colors.some(
        (color) => color.name.toLowerCase() === newColor.name.toLowerCase()
      )
    ) {
      setUploadError("Color name already exists");
      return;
    }

    const newId = Date.now();
    setColors((prev) => [
      ...prev,
      {
        id: newId,
        name: newColor.name.trim(),
        color: newColor.color,
        hex: newColor.hex,
        images: [],
        stock: 0,
        sizes: [],
        isActive: false,
      },
    ]);

    setActiveColorId(newId);
    setNewColor({ name: "", color: "#000000", hex: "000000" });
    setShowColorPopup(false);
    setUploadError("");
  }, [newColor, colors, setColors]);

  const removeColor = useCallback(
    (id: number) => {
      if (colors.length <= 1) {
        setUploadError("Must have at least one color");
        return;
      }

      setColors((prev) => {
        const filtered = prev.filter((color) => color.id !== id);
        if (activeColorId === id && filtered.length > 0) {
          setActiveColorId(filtered[0].id);
        } else if (filtered.length === 0) {
          setActiveColorId(null);
        }
        return filtered;
      });
      setUploadError("");
    },
    [colors.length, activeColorId, setColors]
  );

  const selectColor = useCallback(
    (id: number) => {
      setActiveColorId(id);
      setUploadError("");
    },
    [setActiveColorId]
  );

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only PNG and JPEG files are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 10MB`;
    }
    return null;
  }, []);

  // Image management
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (!activeColor) {
        setUploadError("Please select a color first");
        return;
      }

      const fileArray = Array.from(files);
      const remainingSlots = MAX_IMAGES - activeColor.images.length;

      if (fileArray.length > remainingSlots) {
        setUploadError(
          `Can only add ${remainingSlots} more image(s) to this color`
        );
        return;
      }

      // Validate all files first
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (validationErrors.length > 0) {
        setUploadError(validationErrors.join(". "));
        return;
      }

      // Process valid files
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newImage: ProductImage = {
              id: Date.now() + Math.random(),
              url: e.target.result,
              name: file.name,
              file: file,
            };

            setColors((prev) =>
              prev.map((color) =>
                color.id === activeColorId
                  ? { ...color, images: [...color.images, newImage] }
                  : color
              )
            );
          }
        };
        reader.readAsDataURL(file);
      });

      setUploadError("");
    },
    [activeColor, activeColorId, validateFile]
  );

  const removeImage = useCallback(
    (imageId: number) => {
      setColors((prev) =>
        prev.map((color) =>
          color.id === activeColorId
            ? {
                ...color,
                images: color.images.filter((img) => img.id !== imageId),
              }
            : color
        )
      );
    },
    [activeColorId]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const triggerFileSelect = useCallback(() => {
    if (!activeColor) {
      setUploadError("Please add and select a color first");
      return;
    }
    fileInputRef.current?.click();
  }, [activeColor]);

  const ImgDiv: React.FC<{
    image: ProductImage;
    onRemove: (id: number) => void;
  }> = ({ image, onRemove }) => (
    <div
      className="w-[220px] md:w-[200px] h-[300px] bg-white flex-shrink-0  lg:w-[25%] md:h-full relative border
     border-black/20 rounded-[20px] inline-block overflow-hidden"
    >
      <div
        className="absolute top-[6px] right-[6px] z-20 size-6 border border-black/20 rounded-full flex items-center justify-center cursor-pointer"
        onClick={() => onRemove(image.id)}
      >
        <div className="w-[60%] h-[1px] bg-black rotate-45 absolute"></div>
        <div className="w-[60%] h-[1px] bg-black rotate-[-45deg]"></div>
      </div>
      <Image
        src={typeof image?.url === "string" ? image.url : "/images/hero-2.png"}
        fill
        alt={image.name}
        className="object-cover transition-transform duration-200"
      />
    </div>
  );

  return (
    <>
      {/* Mobile color selector */}
      <div className="mb-3 mt-6 w-full p-2 md:hidden">
        <div className="w-full mini-h-24 bg-white border border-black/20  rounded-2xl p-2 flex flex-col items-end">
          <div className="relative">
            <div
              onClick={() => setShowColorPopup(!showColorPopup)}
              className="size-8 bg-black rounded-full  items-center justify-center cursor-pointer flex "
            >
              <Image
                src="/icons/plus-w.svg"
                width={18}
                height={18}
                alt="plus"
              />
            </div>
            {showColorPopup && (
              <div className="absolute w-[180px] h-fit pb-4 bg-white shadow-2xl border border-black/20 rounded-2xl bottom-6 right-4 p-3">
                <p className="font-avenir text-lg">Color name</p>
                <input
                  value={newColor.name}
                  onChange={(e) =>
                    setNewColor((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter color name"
                  className="w-full border placeholder:text-black/30 text-sm border-black/10 bg-black/5 rounded-lg mt-2 h-8 p-2 focus:outline-none focus-within:border-black/30"
                />
                <input
                  type="color"
                  value={newColor.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full mt-2 h-10"
                />
                <div className="flex justify-end mt-2">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xs">HEX</p>
                    <input
                      value={newColor.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      placeholder="000000"
                      className="w-[60%] border placeholder:text-black/30 text-sm border-black/10  h-8 p-2 focus:outline-none focus-within:border-black/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 w-full font-avenir ">
                  <button
                    onClick={() => setShowColorPopup(false)}
                    className="w-full px-3 py-0.5 text-sm border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addColor}
                    className=" w-full px-3 py-0.5 text-sm bg-black text-white rounded-md hover:bg-black/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            {colors.length === 0 && (
              <p className="w-full text-center text-md p-2 text-black/70 font-avenir">
                Click the plus to add color
              </p>
            )}

            <div className="w-[80%] mx-2 grid grid-cols-2 gap-2 pb-2">
              {colors.map((color) => (
                <button
                  onClick={() => selectColor(color.id)}
                  key={color.id}
                  type="button"
                  className={`flex  justify-between gap-2 px-1 sm:px-3  cursor-pointer py-0.5 sm:py-1 rounded-[24px]
                  ${
                    activeColorId === color.id
                      ? "bg-black/20 border border-black/20"
                      : "bg-black/2 border border-black/10"
                  }
                `}
                >
                  <div className="flex items-center gap-1">
                    <div
                      style={{ backgroundColor: color.color }}
                      className="size-4.5 border border-black/30  rounded-full "
                    ></div>
                    <p className="font-avenir uppercase pt-1 sm:pt-[0.4px] text-[11px] sm:text-sm">
                      {color.name}
                    </p>
                  </div>
                  <div className="flex items-centern gap-1">
                    <div className="flex items-center gap-1 mt-[2px]">
                      <span className="text-[10px] opacity-60">
                        {color.images.length}/{MAX_IMAGES}
                      </span>
                      {color.images.length >= MIN_IMAGES && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColor(color.id);
                      }}
                      className="relative z-20 size-5 border border-black/20 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-[60%] h-[1px] bg-red-500 rotate-45 absolute "></div>
                      <div className="w-[60%] h-[1px] bg-red-500 rotate-[-45deg]"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main media upload area */}
      <div className="w-full  min-h-[390px] md:h-[420px] bg-white border border-black/20 rounded-[35px] inline-block self-start p-2   md:mt-6 cursor-pointer">
        <div className="w-full h-full flex-1  bg-black/5 border border-dashed border-black/20  rounded-3xl p-2 relative">
          <div className="flex justify-between items-center">
            <div className=" items-center gap-3 sm:flex hidden">
              {/* Desktop color selector */}

              {colors.map((color) => (
                <button
                   type="button"
                  onClick={() => selectColor(color.id)}
                  key={color.id}
                  className={`flex  gap-2 px-1 sm:px-3  cursor-pointer py-0.5 sm:py-1 rounded-[24px]
                  ${
                    activeColorId === color.id
                      ? "bg-black/20 border border-black/20"
                      : "bg-black/2 border border-black/10"
                  }
                `}
                >
                  <div
                    style={{ backgroundColor: color.color }}
                    className="size-4.5 border border-black/30  rounded-full"
                  ></div>
                  <p className="font-avenir uppercase pt-1 sm:pt-[0.4px] text-[11px] sm:text-sm">
                    {color.name}
                  </p>
                  <div className="flex items-center gap-1 mt-[2px]">
                    <span className="text-[10px] opacity-60">
                      {color.images.length}/{MAX_IMAGES}
                    </span>
                    {color.images.length >= MIN_IMAGES && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColor(color.id);
                    }}
                    className="relative z-20 size-5 border border-black/20 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-[60%] h-[1px] bg-red-500 rotate-45 absolute "></div>
                    <div className="w-[60%] h-[1px] bg-red-500 rotate-[-45deg]"></div>
                  </div>
                </button>
              ))}
            </div>
            <div className=" items-center gap-2 relative hidden sm:flex">
              <p className="font-avenir font-[500] text-sm sm:text-sm">
                Add Color
              </p>
              <div
                onClick={() => setShowColorPopup(!showColorPopup)}
                className="size-8 bg-black rounded-full  items-center justify-center cursor-pointer flex "
              >
                <Image
                  src="/icons/plus-w.svg"
                  width={18}
                  height={18}
                  alt="plus"
                />
              </div>
              {showColorPopup && (
                <div className="absolute w-[180px] h-fit pb-4 bg-white shadow-2xl border border-black/20 rounded-2xl bottom-6 right-4 p-3">
                  <p className="font-avenir text-lg">Color name</p>
                  <input
                    value={newColor.name}
                    onChange={(e) =>
                      setNewColor((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter color name"
                    className="w-full border placeholder:text-black/30 text-sm border-black/10 bg-black/5 rounded-lg mt-2 h-8 p-2 focus:outline-none focus-within:border-black/30"
                  />
                  <input
                    type="color"
                    value={newColor.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full mt-2 h-10"
                  />
                  <div className="flex justify-end mt-2">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-xs">HEX</p>
                      <input
                        value={newColor.hex}
                        onChange={(e) => handleHexChange(e.target.value)}
                        placeholder="000000"
                        className="w-[60%] border placeholder:text-black/30 text-sm border-black/10  h-8 p-2 focus:outline-none focus-within:border-black/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 w-full font-avenir ">
                    <button
                     type="button"
                      onClick={() => setShowColorPopup(false)}
                      className="w-full px-3 py-0.5 text-sm border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                     type="button"
                      onClick={addColor}
                      className=" w-full px-3 py-0.5 text-sm bg-black text-white rounded-md hover:bg-black/80 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Upload error display */}
          {uploadError  && (
            <div className="flex items-center justify-center">
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-full px-6">
                <p className="text-red-700 text-sm font-avenir">
                  {uploadError}
                </p>
              </div>
            </div>
          )}

          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileSelect}
            className="w-full min-h-[300px] md:h-[300px] flex items-center  flex-col justify-center gap-2  relative overflow-hidden"
          >
            {!activeColor ? (
              <div className="text-center">
                <p className="text-xl font-avenir text-black/50">
                  Add a color first to start
                  <br />
                  uploading images
                </p>
              </div>
            ) : activeColor.images.length === 0 ? (
              <div className="text-center cursor-pointer">
                <p className="text-xl font-avenir text-black/50">
                  Click to select or drag
                  <br />
                  and drop product images
                </p>
                <p className="text-xs font-avenir text-black/30 mt-2">
                  MAX SIZE 10MB (PNG, JPEG) • {MIN_IMAGES}-{MAX_IMAGES} images
                  per color
                </p>
                {needsMoreImages && (
                  <p className="text-sm font-avenir text-orange-600 mt-2">
                    Need {MIN_IMAGES - activeColor.images.length} more image(s)
                    minimum
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-full p-2 grid-cols-1 grid md:flex gap-2 overflow-x-auto scrollbar-hide">
                {activeColor.images.map((image) => (
                  <ImgDiv key={image.id} image={image} onRemove={removeImage} />
                ))}
                {canAddImages && (
                  <div
                    className="w-[220px] h-[300px] md:w-[200px] flex-shrink-0 lg:min-w-[25%] md:h-full border-2 border-dashed border-black/30 rounded-[20px] flex items-center justify-center cursor-pointer hover:border-black/50 hover:bg-black/5 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileSelect();
                    }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Image
                          src="/icons/plus-w.svg"
                          width={20}
                          height={20}
                          alt="Add"
                          className="invert opacity-60"
                        />
                      </div>
                      <p className="text-sm text-black/60">Add Image</p>
                      <p className="text-xs text-black/40">
                        {MAX_IMAGES - activeColor.images.length} remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {activeColor && activeColor.images.length > 0 && (
            <div className="absolute bottom-5 w-full  justify-center hidden sm:flex">
              <div className="flex items-center gap-6">
                <Image
                  src="/icons/arrow.svg"
                  width={14}
                  height={14}
                  alt="Previous"
                  className="rotate-90 cursor-pointer hover:opacity-60 transition-opacity"
                />
                <div className="flex items-center gap-2">
                  {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-6 h-2 rounded-full transition-all duration-200 ${
                        index < activeColor.images.length
                          ? index < MIN_IMAGES
                            ? "bg-green-500"
                            : "bg-black/60"
                          : "bg-black/20"
                      }`}
                    />
                  ))}
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={14}
                  height={14}
                  alt="Next"
                  className="rotate-[-90deg] cursor-pointer hover:opacity-60 transition-opacity"
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};

const Category = ({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      return;
    }
    setCategories((prev) => [...prev, newCategory.trim()]);
    setSelectedCategory(newCategory.trim());
    setNewCategory("");
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="font-avenir font-[500] text-lg ">Category</p>
        <div className="flex items-center gap-2 relative">
          <p className="font-avenir font-[500] text-sm hidden lg:flex">
            Add Category
          </p>
          <div
            onClick={() => setShowForm((prev) => !prev)}
            className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer"
          >
            <Image src="/icons/plus-w.svg" width={16} height={16} alt="plus" />
          </div>
          {showForm && (
            <div className="absolute w-[180px] h-fit pb-4 bg-white shadow-2xl border border-black/20 rounded-2xl bottom-6 right-4 p-3">
              <p className="font-avenir text-lg">Category</p>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full border placeholder:text-black/30 text-sm border-black/10 bg-black/5 rounded-lg mt-2 h-8 p-2 focus:outline-none focus-within:border-black/30"
              />

              <div className="flex gap-2 mt-4 w-full font-avenir ">
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory("");
                    setShowForm(false);
                  }}
                  className="w-full px-3 py-0.5 text-sm border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className=" w-full px-3 py-0.5 text-sm bg-black text-white rounded-md hover:bg-black/80 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-2 flex items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
        >
          <option value="">Select category</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="absolute right-3">
          <Image src="/icons/arrow.svg" width={16} height={16} alt="arrow" />
        </div>
      </div>
    </div>
  );
};

const ProductTags = ({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="mt-4">
      <p className="font-avenir font-[500] text-lg">Product Tags</p>

      <div className="flex items-center w-full h-12 border border-black/20 rounded-2xl p-2 mt-2 focus-within:border-black/50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter tag"
          className="w-full h-full p-2 focus:outline-none"
        />
        <div
          onClick={addTag}
          className="size-8 border flex-none rounded-full border-black/20 cursor-pointer flex items-center justify-center hover:bg-black/5"
        >
          <Image src="/icons/plus.svg" width={16} height={16} alt="plus" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-black/50">Tags</p>
        <div className="mt-2 flex gap-2 flex-wrap ">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-black rounded-full flex items-center gap-2 text-white text-sm font-avenir cursor-pointer"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-3 h-3 relative flex items-center justify-center"
              >
                <div className="w-[1px] h-[12px] bg-white rotate-45 absolute"></div>
                <div className="w-[1px] h-[12px] bg-white -rotate-45 absolute"></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



const ColorStockAndSizes = ({
  colors,
  setColors,
  activeColorId,
}: {
  colors: ProductColor[];
  setColors: React.Dispatch<React.SetStateAction<ProductColor[]>>;
  activeColorId: number;
}) => {
  const [selectedSize, setSelectedSize] = useState("");
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const activeColor = colors.find((c) => c.id === activeColorId);

  if (!activeColor) return null;

  const updateColorStock = (stock: string) => {
    const stockNumber = parseInt(stock) || 0;
    setColors((prev) =>
      prev.map((color) =>
        color.id === activeColorId ? { ...color, stock: stockNumber } : color
      )
    );
  };

  const addSizeToColor = () => {
    if (selectedSize && !activeColor.sizes.includes(selectedSize)) {
      setColors((prev) =>
        prev.map((color) =>
          color.id === activeColorId
            ? { ...color, sizes: [...color.sizes, selectedSize] }
            : color
        )
      );
      setSelectedSize("");
    }
  };

  const removeSizeFromColor = (sizeToRemove: string) => {
    setColors((prev) =>
      prev.map((color) =>
        color.id === activeColorId
          ? {
              ...color,
              sizes: color.sizes.filter((size) => size !== sizeToRemove),
            }
          : color
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Color Info Display */}

      {/* Stock Management */}
      <div>
        <p className="font-avenir font-[500] text-lg mb-2">Stock Quantity</p>
        <input
          type="number"
          value={activeColor.stock}
          onChange={(e) => updateColorStock(e.target.value)}
          placeholder="0"
          min="0"
          className="focus:outline-none w-full h-12 border border-black/20 rounded-2xl p-3 focus-within:border-black/50"
        />
      </div>

      {/* Size Management */}
      <div>
        <p className="font-avenir font-[500] text-lg mb-2">Available Sizes</p>

        {/* Add Size */}
        <div className="flex items-center w-full h-12 border border-black/20 rounded-2xl p-2 mb-3 focus-within:border-black/50">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full appearance-none focus:outline-none px-2"
          >
            <option value="">Select size to add</option>
            {availableSizes
              .filter((size) => !activeColor.sizes.includes(size))
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>
          <button
            onClick={addSizeToColor}
            disabled={!selectedSize}
            className="size-8 border flex-none rounded-full border-black/20 cursor-pointer flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image src="/icons/plus.svg" width={16} height={16} alt="plus" />
          </button>
        </div>

        {/* Current Sizes */}
        <div>
          <p className="text-black/50 text-sm mb-2">Current Sizes</p>
          {activeColor.sizes.length === 0 ? (
            <p className="text-black/40 text-center py-4">No sizes added yet</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {activeColor.sizes.map((size, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-black/5 border border-black/20 rounded-lg flex items-center gap-2 text-sm font-avenir cursor-pointer">
                  <span>{size}</span>
                  <div
                    onClick={() => removeSizeFromColor(size)}
                    className="w-3 h-3 relative flex items-center justify-center">
                    <div className="w-[1px] h-[12px] bg-black rotate-45 absolute"></div>
                    <div className="w-[1px] h-[12px] bg-black -rotate-45 absolute"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={`mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200 `}>
          <div className="flex justify-between text-sm">
            <span className="text-blue-700 font-aveni">Total Stock:</span>
            <span className="font-medium text-blue-800 font-aveni">
              {activeColor.stock} units
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-blue-700 font-aveni">Available Sizes:</span>
            <span className="font-medium text-blue-800 font-avenir">
              {activeColor.sizes.length > 0
                ? activeColor.sizes.join(", ")
                : "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
