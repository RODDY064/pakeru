"use client";

import { capitalize } from "@/libs/functions";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AttachPicker from "./attachPicker";
import { useForm } from "react-hook-form";
import {
  GalleryContent,
  HeroContent,
} from "@/store/dashbaord/content-store/content";
import { useApiClient } from "@/libs/useApiClient";
import { toast } from "../toaster";

interface ImageDimensions {
  width: number;
  height: number;
}

interface DeviceRequirements {
  desktop: ImageDimensions;
  tablet: ImageDimensions;
  mobile: ImageDimensions;
  gallery: ImageDimensions;
}

interface ImageState {
  file?: File;
  previewUrl: string;
  hasChanged: boolean;
}

interface GalleryItem {
  _id: string;
  name: string;
  image: { _id: string; publicId: string; url: string };
  products: string[];
}

interface FormData {
  description?: string;
  name: string;
  title: string;
}

export default function EditContent({
  setShouldRefresh,
}: {
  setShouldRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isContentModalOpen, toggleContentModal, contentModalType, content } =
    useBoundStore();
  const { patch, post } = useApiClient();

  // Track original data for change detection
  const [originalData, setOriginalData] = useState<{
    title?: string;
    description?: string;
    name?: string;
    products?: string[];
  }>({});

  // Determine create vs edit mode
  const isCreateMode =
    !content ||
    (content.type === "hero" && !(content as HeroContent)._id) ||
    (content.type === "gallery" && !((content as GalleryContent).items?.[0]?._id));

  // Image states - track files and preview URLs separately
  const [heroImages, setHeroImages] = useState<Record<string, ImageState>>({
    desktop: { previewUrl: "", hasChanged: false },
    tablet: { previewUrl: "", hasChanged: false },
    mobile: { previewUrl: "", hasChanged: false },
  });

  const [galleryImage, setGalleryImage] = useState<ImageState>({
    previewUrl: "",
    hasChanged: false,
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  const requiredDimensions: DeviceRequirements = {
    desktop: { width: 2560, height: 1440 },
    tablet: { width: 2048, height: 1536 },
    mobile: { width: 828, height: 1000 },
    gallery: { width: 1740, height: 1230 },
  };

  const validateImage = (
    file: File,
    deviceType: keyof DeviceRequirements
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const required = requiredDimensions[deviceType];
        const isValidDimensions =
          img.width === required.width && img.height === required.height;

        if (!isValidDimensions) {
          setImageErrors((prev) => ({
            ...prev,
            [deviceType]: `Image must be ${required.width}x${required.height}px. Current: ${img.width}x${img.height}px`,
          }));
          resolve(false);
        } else {
          setImageErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[deviceType];
            return newErrors;
          });
          resolve(true);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (
    file: File,
    deviceType: keyof DeviceRequirements
  ) => {
    const allowedTypes = ["image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageErrors((prev) => ({
        ...prev,
        [deviceType]: "Only WebP images are allowed",
      }));
      return;
    }

    const isValidDimensions = await validateImage(file, deviceType);
    if (!isValidDimensions) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (deviceType === "gallery") {
      setGalleryImage({ file, previewUrl, hasChanged: true });
    } else {
      setHeroImages((prev) => ({
        ...prev,
        [deviceType]: { file, previewUrl, hasChanged: true },
      }));
    }
  };

  // Load existing content when modal opens
  useEffect(() => {
    if (!isContentModalOpen) return;

    if (isCreateMode) {
      // Reset to empty state
      reset();
      setHeroImages({
        desktop: { previewUrl: "", hasChanged: false },
        tablet: { previewUrl: "", hasChanged: false },
        mobile: { previewUrl: "", hasChanged: false },
      });
      setGalleryImage({ previewUrl: "", hasChanged: false });
      setSelectedProducts([]);
      setImageErrors({});
      setOriginalData({});
      return;
    }

    // Load existing data for edit mode
    if (!content) return;

    if (content.type === "hero" && contentModalType === "hero") {
      const heroContent = content as HeroContent;
      setValue("title", heroContent.title ?? "");
      setValue("description", heroContent.description ?? "");
      
      setOriginalData({
        title: heroContent.title,
        description: heroContent.description,
      });

      // Load existing images as previews
      const newHeroImages: Record<string, ImageState> = {};
      heroContent.hero.forEach((item) => {
        newHeroImages[item.name] = {
          previewUrl: item.image.url ?? "",
          hasChanged: false,
        };
      });
      setHeroImages(newHeroImages);
    } else if (content.type === "gallery" && contentModalType === "gallery") {
      const galleryContent = content as GalleryContent;
      const firstItem = galleryContent.items?.[0];
      
      if (firstItem) {
        setValue("name", firstItem.name ?? "");
        setSelectedProducts(firstItem.products ?? []);
        
        setOriginalData({
          name: firstItem.name,
          products: firstItem.products,
        });

        setGalleryImage({
          previewUrl: firstItem.image?.url ?? "",
          hasChanged: false,
        });
      }
    }
  }, [isContentModalOpen, content, contentModalType, setValue, isCreateMode, reset]);

  const onSubmit = async (data: FormData) => {
    setIsUploading(true);
    try {
      if (contentModalType === "hero") {
        const formData = new FormData();

        if (isCreateMode) {
          // CREATE: Send all data
          formData.append("title", data.title || "");
          formData.append("description", data.description || "");

          // Rename and attach image files to 'images' field
          Object.entries(heroImages).forEach(([deviceType, imageState]) => {
            if (imageState.file) {
              const renamedFile = new File(
                [imageState.file],
                deviceType,
                { type: imageState.file.type }
              );
              formData.append("images", renamedFile);
            }
          });

          await saveContentToast(
            post("/content/hero", formData, { requiresAuth: true }),
            "hero",
            { setShouldRefresh },
            true
          );
        } else {
          // UPDATE: Send only changes
          const formData = new FormData();
          let hasChanges = false;

          if (data.title !== originalData.title) {
            formData.append("title", data.title);
            hasChanges = true;
          }

          if (data.description !== originalData.description) {
            formData.append("description", data.description || "");
            hasChanges = true;
          }

          // Only attach changed images
          Object.entries(heroImages).forEach(([deviceType, imageState]) => {
            if (imageState.hasChanged && imageState.file) {
              const renamedFile = new File(
                [imageState.file],
                deviceType,
                { type: imageState.file.type }
              );
              formData.append("images", renamedFile);
              hasChanges = true;
            }
          });

          if (hasChanges) {
            const contentId = (content as any)?._id;
            await saveContentToast(
              patch(`/content/hero/${contentId}`, formData, { requiresAuth: true }),
              "hero",
              { setShouldRefresh },
              false
            );
          }
        }
      } else if (contentModalType === "gallery") {
        const formData = new FormData();

        if (isCreateMode) {
          // CREATE: Send all data
          formData.append("name", data.name || "");
          
          if (galleryImage.file) {
            formData.append("image", galleryImage.file);
          }
          
          formData.append("products", JSON.stringify(selectedProducts));

          await saveContentToast(
            post("/content/gallery", formData, { requiresAuth: true }),
            "gallery",
            { setShouldRefresh },
            true
          );
        } else {
          // UPDATE: Send only changes
          let hasChanges = false;

          if (data.name !== originalData.name) {
            formData.append("name", data.name || "");
            hasChanges = true;
          }

          if (galleryImage.hasChanged && galleryImage.file) {
            const renamedFile = new File(
              [galleryImage.file],
              "gallery",
              { type: galleryImage.file.type }
            );
            formData.append("image", renamedFile);
            hasChanges = true;
          }

          const productsChanged =
            JSON.stringify([...selectedProducts].sort()) !==
            JSON.stringify([...(originalData.products || [])].sort());

          if (productsChanged) {
            formData.append("products", JSON.stringify(selectedProducts));
            hasChanges = true;
          }

          if (hasChanges) {
            const contentId = (content as GalleryContent).items?.[0]._id;
            await saveContentToast(
              patch(`/content/gallery/${contentId}`, formData, { requiresAuth: true }),
              "gallery",
              { setShouldRefresh },
              false
            );
          }
        }
      }

      toggleContentModal(false);
      reset();
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderImageUploadSection = (
    deviceType: "desktop" | "tablet" | "mobile",
    height: string
  ) => {
    const imageState = heroImages[deviceType];
    const hasImage = imageState?.previewUrl;
    const error = imageErrors[deviceType];
    const required = requiredDimensions[deviceType];

    return (
      <div className="mt-10 first:mt-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-avenir text-lg mx-2">{capitalize(deviceType)}</p>
          <p className="text-sm text-black/60 mx-2">
            Required: {required.width}x{required.height}px
          </p>
        </div>

        {error && (
          <div className="mx-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div
          className={`w-full flex-nowrap flex-none ${height} bg-black/5 flex border border-dashed border-black/30 items-center justify-center relative rounded-[36px] overflow-hidden`}
        >
          {hasImage ? (
            <>
              <Image
                src={imageState.previewUrl}
                fill
                alt={`${deviceType} hero image`}
                className="object-contain bg-white"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium">Change Image</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center">
                <Image
                  src="/icons/plus-w.svg"
                  width={30}
                  height={30}
                  alt="Add"
                  className="invert opacity-60"
                />
              </div>
              <div className="text-center">
                <p className="text-black/60 text-sm">
                  Upload {deviceType} image
                </p>
                <p className="text-black/40 text-xs mt-1">
                  {required.width}x{required.height}px
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file, deviceType);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="absolute bottom-3 right-3 size-8 z-50 md:size-16 bg-black rounded-full text-white flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="w-[20px] h-[1px] bg-white"></div>
              <div className="w-[1px] h-[20px] bg-white absolute"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGalleryImageUploadSection = () => {
    const hasImage = galleryImage.previewUrl;
    const error = imageErrors.gallery;
    const required = requiredDimensions.gallery;

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-avenir text-lg mx-2">Gallery Image</p>
          <p className="text-sm text-black/60 mx-2">
            Required: {required.width}x{required.height}px
          </p>
        </div>

        {error && (
          <div className="mx-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="w-full flex-nowrap flex-none h-[400px] bg-black/5 flex border border-dashed border-black/30 items-center justify-center relative rounded-[36px] overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={galleryImage.previewUrl}
                fill
                alt="Gallery image"
                className="object-contain bg-white"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium">Change Image</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center">
                <Image
                  src="/icons/plus-w.svg"
                  width={30}
                  height={30}
                  alt="Add"
                  className="invert opacity-60"
                />
              </div>
              <div className="text-center">
                <p className="text-black/60 text-sm">Upload gallery image</p>
                <p className="text-black/40 text-xs mt-1">
                  {required.width}x{required.height}px
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file, "gallery");
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="absolute bottom-3 right-3 size-8 z-50 md:size-16 bg-black rounded-full text-white flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="w-[20px] h-[1px] bg-white"></div>
              <div className="w-[1px] h-[20px] bg-white absolute"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed w-full h-full bg-black/80 top-0 left-0 z-[99] ${
        isContentModalOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div className="w-full h-full flex justify-end">
        <AnimatePresence>
          <motion.div
            animate={isContentModalOpen ? "open" : "close"}
            variants={container}
            initial="close"
            exit="close"
            className="w-[40%] bg-white h-full"
          >
            <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
              <div className="flex items-center gap-4">
                <p className="font-avenir text-lg font-normal pt-1">
                  {isCreateMode ? "Create" : "Edit"} {capitalize(contentModalType as string)}
                </p>
              </div>
              <div
                onClick={() => toggleContentModal(false)}
                className="flex gap-1 cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                  <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute"></div>
                </div>
                <p className="capitalize font-avenir font-[400] text-sm mt-1">
                  CLOSE
                </p>
              </div>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="h-full overflow-scroll pb-24 px-10 pt-10"
            >
              {contentModalType === "hero" ? (
                <>
                  {renderImageUploadSection("desktop", "h-[400px]")}
                  {renderImageUploadSection("tablet", "h-[350px]")}
                  {renderImageUploadSection("mobile", "h-[300px]")}
                </>
              ) : (
                <>{renderGalleryImageUploadSection()}</>
              )}
              <div className="mt-8">
                {contentModalType === "hero" && (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Title</label>
                      <input
                        id="title"
                        {...register("title", { required: true })}
                        placeholder="e.g Made for you"
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="font-avenir text-lg">Description</label>
                      <textarea
                        id="description"
                        {...register("description")}
                        placeholder="e.g DEFY THE NORM"
                        className="border min-h-[90px] max-h-[90px] h-[90px] border-black/30 w-full mt-2 rounded-xl focus:outline-none focus:border-black/60 p-2"
                      />
                    </div>
                  </>
                )}

                {contentModalType === "gallery" && (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Name</label>
                      <input
                        {...register("name", { required: true })}
                        placeholder="e.g Aegis"
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                    <AttachPicker
                      type="products"
                      productsLink={
                        content?.type === "gallery"
                          ? content.items?.[0].products
                          : []
                      }
                    />
                  </>
                )}
                <div className="flex gap-3 my-10">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`rounded-full p-4 w-full cursor-pointer border ${
                      isUploading
                        ? "bg-black/50 border-black/50"
                        : "border-black bg-black"
                    }`}
                  >
                    <p className="text-white text-md font-avenir text-center">
                      {isUploading ? "Uploading..." : isCreateMode ? "Create" : "Update"}
                    </p>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
  close: {
    x: 700,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

async function saveContentToast<T>(
  action: Promise<T>,
  entity: "hero" | "gallery",
  { setShouldRefresh }: { setShouldRefresh: React.Dispatch<React.SetStateAction<boolean>> },
  isCreate: boolean
): Promise<T> {
  return toast.promise(action, {
    loading: {
      title: `${isCreate ? "Creating" : "Saving"} ${entity} content...`,
      description: `Please wait while we ${isCreate ? "create" : "update"} your ${entity}`,
      duration: Infinity,
    },
    success: {
      title: `${entity[0].toUpperCase() + entity.slice(1)} content ${isCreate ? "created" : "updated"}`,
      description: `The ${entity} section was ${isCreate ? "created" : "saved"} successfully. Please refresh to see the changes.`,
    },
    error: (error) => ({
      title: `Failed to ${isCreate ? "create" : "update"} ${entity} content`,
      description: error?.message || "Please try again",
    }),
    position: "top-left",
  }).then((res) => {
    setShouldRefresh(true);
    setTimeout(() => setShouldRefresh(false), 10000);
    return res;
  });
}