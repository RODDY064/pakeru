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

interface ImageData {
  _id: string;
  publicId: string;
  url: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  image: ImageData;
  products: string[];
}

interface FormData {
  title: string;
  description?: string;
  name?: string;
}

export default function EditContent() {
  const { isContentModalOpen, toggleContentModal, contentModalType, content } =
    useBoundStore();

  const [heroItems, setHeroItems] = useState<HeroContent["hero"]>([
    { name: "desktop", image: { _id: "", publicId: "", url: "" } },
    { name: "tablet", image: { _id: "", publicId: "", url: "" } },
    { name: "mobile", image: { _id: "", publicId: "", url: "" } },
  ]);

 

  const [galleryItem, setGalleryItem] = useState<Omit<GalleryItem, "_id">>({
    title: "",
    image: { _id: "", publicId: "", url: "" },
    products: [],
  });

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormData>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  const requiredDimensions: DeviceRequirements = {
    desktop: { width: 2560, height: 1440 },
    tablet: { width: 2048, height: 1536 },
    mobile: { width: 828, height: 1000 },
    gallery: { width: 800, height: 600 },
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
    // Check file type
    const allowedTypes = ["image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageErrors((prev) => ({
        ...prev,
        [deviceType]: "Only WebP images are allowed",
      }));
      return;
    }

    // Validate dimensions
    const isValidDimensions = await validateImage(file, deviceType);
    if (!isValidDimensions) {
      return;
    }

    // If validation passes, upload the image
    setIsUploading(true);
    try {
      // Here you would typically upload to your storage service
      // For now, we'll create a mock URL
      const mockImageData: ImageData = {
        _id: `mock_${Date.now()}`,
        publicId: `mock_${file.name}`,
        url: URL.createObjectURL(file),
      };

      if (deviceType === "gallery") {
        handleGalleryImageUpload(mockImageData);
      } else {
        handleHeroImageUpload(
          deviceType as "desktop" | "tablet" | "mobile",
          mockImageData
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageErrors((prev) => ({
        ...prev,
        [deviceType]: "Failed to upload image. Please try again.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image upload for hero items
  // Handle gallery image upload
  const handleHeroImageUpload = (
    deviceType: "desktop" | "tablet" | "mobile",
    imageData: ImageData
  ) => {
    setHeroItems((prev) =>
      prev.map((item) =>
        item.name === deviceType ? { ...item, image: imageData } : item
      )
    );
  };

  const handleGalleryImageUpload = (imageData: ImageData) => {
    setGalleryItem((prev) => ({ ...prev, image: imageData }));
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsUploading(true);
    try {
      if (contentModalType === "hero") {
        const updatedHero: HeroContent = {
          type: "hero",
          title: data.title,
          description: data.description || "",
          hero: heroItems,
        };

        console.log("Saving hero content:", updatedHero);
      } else if (contentModalType === "gallery") {
        const updatedGalleryItem = {
          ...galleryItem,
          title: data.name || "",
          products: selectedProducts,
        };

        // Here you would typically call an API to save the gallery content
        console.log("Saving gallery content:", {
          type: "gallery",
          items: [updatedGalleryItem],
        });
      }

      // Close modal after successful save
      toggleContentModal(false);
      reset();
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isContentModalOpen) {
      reset();
      setHeroItems([
        { name: "desktop", image: { _id: "", publicId: "", url: "" } },
        { name: "tablet", image: { _id: "", publicId: "", url: "" } },
        { name: "mobile", image: { _id: "", publicId: "", url: "" } },
      ]);
      setGalleryItem({
        title: "",
        image: { _id: "", publicId: "", url: "" },
        products: [],
      });
      setSelectedProducts([]);
      setImageErrors({});
    }
  }, [isContentModalOpen, reset]);


  
    // Load existing content when modal opens
    useEffect(() => {
  if (!isContentModalOpen || !content) return;

  switch (content.type) {
    case "hero": {
      if (contentModalType === "hero") {
        // content is HeroContent here
        setHeroItems(content.hero);
        setValue("title", content.title ?? "");
        setValue("description", content.description ?? "");
      }
      break;
    }
    case "gallery": {
      if (contentModalType === "gallery") {
        // content is GalleryContent here
        const firstItem = content.items?.[0];
        if (firstItem) {
          setValue("name", firstItem.title ?? "");
          setSelectedProducts(firstItem.products ?? []);
        }
      }
      break;
    }
  }
}, [isContentModalOpen, content, contentModalType, setValue]);




  useEffect(()=>{

  })


  const renderImageUploadSection = (
    deviceType: "desktop" | "tablet" | "mobile",
    height: string
  ) => {
    const item = heroItems.find((h) => h.name === deviceType);
    const hasImage = item?.image.url;
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
                src={item.image.url as string??"/images/image-fallback.png"}
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
                  Edit {capitalize(contentModalType as string)}
                </p>
              </div>
              <div
                onClick={() => toggleContentModal(false)}
                className="flex  gap-1 cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                  <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute "></div>
                </div>
                <p className="capitalize font-avenir font-[400] text-sm mt-1">
                  CLOSE
                </p>
              </div>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="h-full overflow-scroll pb-24 px-10 pt-10 "
            >
              {contentModalType === "hero" ? (
                <>
                  {/* <div>
                    <p className="font-avenir text-lg mx-2 mb-2">Desktop</p>
                    <div className="w-full flex-nowrap flex-none h-[400px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                          <Image
                            src="/icons/plus-w.svg"
                            width={30}
                            height={30}
                            alt="Add"
                            className="invert opacity-60"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[20px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[20px] bg-white absolute"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <p className="font-avenir text-lg mx-2 mb-2">Tablet</p>
                    <div className="w-full flex-nowrap flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                          <Image
                            src="/icons/plus-w.svg"
                            width={30}
                            height={30}
                            alt="Add"
                            className="invert opacity-60"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[20px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[20px] bg-white absolute"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <p className="font-avenir text-lg mx-2 mb-2">Mobile</p>
                    <div className="w-full flex-nowrap flex-none h-[300px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                          <Image
                            src="/icons/plus-w.svg"
                            width={30}
                            height={30}
                            alt="Add"
                            className="invert opacity-60"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[20px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[20px] bg-white absolute"></div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <>
                    {renderImageUploadSection("desktop", "h-[400px]")}
                    {renderImageUploadSection("tablet", "h-[350px]")}
                    {renderImageUploadSection("mobile", "h-[300px]")}
                  </>
                </>
              ) : (
                <>
                  <div className="w-full flex-nowrap flex-none h-[400px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                        <Image
                          src="/icons/plus-w.svg"
                          width={30}
                          height={30}
                          alt="Add"
                          className="invert opacity-60"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <div className="w-[20px] h-[1px] bg-white"></div>
                        <div className="w-[1px] h-[20px] bg-white absolute"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-8">
                {contentModalType === "hero" && (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Tittle</label>
                      <input
                        id="title"
                        {...register("title", { required: true })}
                        placeholder="e.g Made for you "
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="font-avenir text-lg">Description</label>
                      <textarea
                        id="description"
                        {...register("description")}
                        placeholder="e.g DEFY THE NORM"
                        className="border min-h-[90px] max-h-[90px] h-[90px] border-black/30 w-full  mt-2 rounded-xl focus:outline-none focus:border-black/60 p-2 ove"
                      />
                    </div>
                  </>
                )}

                {contentModalType === "gallery" && (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Name</label>
                      <input
                        placeholder="e.g Aegis "
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                    <AttachPicker
                      type={
                        contentModalType === "gallery"
                          ? "products"
                          : "categories"
                      }
                    />
                  </>
                )}

                <div className="flex gap-3 my-10">
                  <div className="rounded-full p-4 bg-black w-full cursor-pointer border border-black">
                    <p className="text-white text-md font-avenir text-center">
                      Upload
                    </p>
                  </div>
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
