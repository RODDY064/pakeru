"use client";

import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type SizeType =
  | "men-shirts"
  | "men-tops"
  | "men-pants"
  | "women-tops"
  | "women-skirts-pants";

interface ClothType {
  _id?: string;
  name: string;
  sizeGuideType: SizeType;
}

interface SizeTypeOption {
  id: SizeType;
  label: string;
  image: string;
}

const sizeTypeOptions: SizeTypeOption[] = [
  {
    id: "men-tops",
    label: "MEN T-SHIRTS & POLO",
    image: "/sizes/admin/men-tshirts.png",
  },
  {
    id: "men-shirts",
    label: "MEN SHIRTS",
    image: "/sizes/admin/men-shirts.png",
  },
  { id: "men-pants", label: "MEN PANTS", image: "/sizes/admin/men-pants.png" },
  {
    id: "women-tops",
    label: "WOMEN TOPS",
    image: "/sizes/admin/woman-tops.png",
  },
  {
    id: "women-skirts-pants",
    label: "WOMEN SKIRTS & PANTS",
    image: "/sizes/admin/woman-skirts.png",
  },
];

export default function ClothTypeModal({
  selectedClothType,
  errors,
}: {
  selectedClothType?: ClothType | any;
  errors?: any;
}) {
  const [showClothModal, setShowClothModal] = useState(false);
  const [editingClothType, setEditingClothType] = useState<ClothType | null>(
    null
  );
  const [clothError, setClothError] = useState<string | null>(null);
  const [selectedSizeType, setSelectedSizeType] =
    useState<SizeType>("men-tops");
  const [clothName, setClothName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { get, patch, post } = useApiClient();
  const { loadClothTypes, clothTypes, createClothTypes, updateClothTypes } =
    useBoundStore();

  useEffect(() => {
    loadClothTypes(get);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ClothType>();


    const handleEdit = (clothType?: ClothType) => {
    if (clothType) {
      setEditingClothType(clothType);
      setClothName(clothType.name);
      setSelectedSizeType(clothType.sizeGuideType);
    } else {
      setEditingClothType(null);
      setClothName("");
      setSelectedSizeType("men-tops");
    }
    setClothError(null);
    setShowClothModal(true);
  };

  const handleCloseModal = () => {
    setShowClothModal(false);
    setEditingClothType(null);
    setClothName("");
    setSelectedSizeType("men-tops");
    setClothError(null);
  };



  const handleSave = async () => {
    if (!clothName.trim()) {
      setClothError("Please enter a cloth type name");
      return;
    }

    setIsSubmitting(true);
    setClothError(null);

    try {
      const formData = new FormData();
      formData.append("name", clothName.trim());
      formData.append("sizeGuideType", selectedSizeType);

      if (editingClothType?._id) {
        // Update existing cloth type
        await updateClothTypes(editingClothType._id, formData, patch);
      } else {
        // Create new cloth type
        await createClothTypes(formData, post);
      }
    } catch (error: any) {
      setClothError(
        error.message ||
          `Failed to ${editingClothType ? "update" : "create"} cloth type`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

   
  const getSizeTypeLabel = (sizeType: string) => {
  if (!sizeType) return "";

  const normalized = sizeType.toLowerCase().replace(/_/g, "-");
  const option = sizeTypeOptions.find((opt) => opt.id === normalized);
  return option ? option.label : sizeType.replace(/_/g, " ").toUpperCase();
};



  return (
    <>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <p className="font-avenir font-[500] text-lg">Cloth Type</p>
          <div className="flex items-center gap-2 relative">
            <p className="font-avenir font-[500] text-sm hidden lg:flex">
              Cloth type
            </p>
            <div
              onClick={() => setShowClothModal(true)}
              className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors">
              <Image
                src="/icons/plus-w.svg"
                width={16}
                height={16}
                alt="plus"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-2 flex items-center">
          <select className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl">
            <option value="">Select cloth type</option>
            {clothTypes.map((cloth) => (
              <option key={cloth._id} value={cloth._id}>
                {cloth.name}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none">
            <Image src="/icons/arrow.svg" width={16} height={16} alt="arrow" />
          </div>
        </div>
        {errors?.sizeType?.clothType && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sizeType?.clothType.message}
          </p>
        )}
      </div>

      <AnimatePresence>
        {showClothModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed w-full h-full inset-0 flex justify-end z-[99]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setShowClothModal(false)}
            />

            {/* Modal Panel */}
            <motion.div
              variants={container}
              initial="close"
              animate="open"
              exit="close"
              className="relative  w-[50%] h-full bg-white overflow-hidden ">
              <div className=" border-b border-black/30 px-10 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-avenir text-lg md:text-xl font-semibold">
                    {editingClothType ? "Edit Cloth Type" : "Create Cloth Type"}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCloseModal()}
                    className="flex gap-1 items-center cursor-pointer hover:opacity-70 transition-opacity"
                    aria-label="Close modal">
                    <div className="relative flex items-center justify-center">
                      <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
                      <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
                    </div>
                    <p className="font-avenir text-sm pt-1 text-black/60">
                      CLOSE
                    </p>
                  </button>
                </div>

                {clothError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3  bg-red-100 border border-red-300 text-red-700 rounded-2xl text-sm"
                  >
                    {clothError}
                  </motion.div>
                )}
              </div>

              <div className="pt-6 h-full space-y-4 overflow-auto  px-10 pb-32">
                <div>
                  <label className="block text-md font-medium font-avenir mb-2">
                    Cloth Type Name
                  </label>
                  <input
                    type="text"
                    value={clothName}
                    onChange={(e) => {
                      setClothName(e.target.value);
                      setClothError(null);
                    }}
                    placeholder="Enter cloth type name"
                    className="w-full border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-xl h-12 px-3 focus:outline-none focus:border-black/30 transition-colors"
                  />
                </div>
                <div className="pt-2">
                  <label className="block text-md font-medium font-avenir ">
                    Select Size Type Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6  mt-4">
                    {sizeTypeOptions.map((option) => (
                      <div
                        onClick={() => setSelectedSizeType(option.id)}
                        key={option.id}
                        className="w-full cursor-pointer"
                      >
                        <button
                          type="button"
                          className="flex gap-3 items-center mb-3 group"
                        >
                          <div
                            className={`size-5 border-2 rounded-full cursor-pointer p-[2px] flex items-center justify-center transition-colors ${
                              selectedSizeType === option.id
                                ? "border-black"
                                : "border-black/30 group-hover:border-black/50"
                            }`}
                          >
                            <div
                              className={`w-full h-full rounded-full transition-colors ${
                                selectedSizeType === option.id
                                  ? "bg-black"
                                  : "bg-transparent"
                              }`}
                            ></div>
                          </div>
                          <p
                            className={`font-avenir text-sm md:text-md pt-[3px] transition-colors ${
                              selectedSizeType === option.id
                                ? "text-black "
                                : "text-black/60 group-hover:text-black/80"
                            }`}
                          >
                            {option.label}
                          </p>
                        </button>
                        <div
                          className={`aspect-square border w-full h-[600px] relative rounded-xl overflow-hidden transition-all ${
                            selectedSizeType === option.id
                              ? "border-black border-2"
                              : "border-black/20"
                          }`}
                        >
                          <Image
                            src={option.image}
                            fill
                            alt={option.label}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className=" flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClothModal(false);
                    }}
                    className="flex-1 h-12 bg-black text-white rounded-xl font-avenir cursor-pointer font-medium hover:bg-black/90 transition-colors"
                  >
                    {editingClothType ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClothModal(false)}
                    className="flex-1 h-12 border border-black/20 text-black rounded-xl cursor-pointer font-avenir font-medium hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-16">
                  <p className="pb-4">Manage Cloth Type</p>
                  <div className="w-full border border-black/50 flex flex-col  rounded-2xl overflow-hidden">
                    {clothTypes.length === 0 ? (
                      <div className="w-full py-4 border-b border-black/50 bg-black/10 px-6 flex items-center justify-between ">
                        <p className="font-avenir text-md text-black/50">
                          No Cloth type data availbale
                        </p>
                      </div>
                    ) : (
                      <>
                        {clothTypes.map((cloth, index) => (
                          <div
                            key={cloth._id}
                            className={`w-full py-4  border-black/50 px-6 flex items-center justify-between overflow-hidden ${
                            index % 2 === 0 ? "bg-black/10" : "bg-transparent"} ${clothTypes.length -1 === index ?"" :"border-b"}`}>
                            <div>
                              <h2 className="font-avenir teext-md">
                                {cloth.name}
                              </h2>
                              <p className="text-sm font-avenir text-black/50">
                               {getSizeTypeLabel(cloth.sizeGuideType)}
                              </p>
                            </div>
                            <div 
                            onClick={() => handleEdit(cloth)}
                            className="cursor-pointer">
                              <Image
                                src="/icons/edit-cat.svg"
                                width={20}
                                height={20}
                                alt="edit"
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      ease: easingShow,
      duration: 0.4,
      opacity: { duration: 0.3 },
    },
  },
  close: {
    x: "100%",
    opacity: 0,
    transition: {
      ease: easingShow,
      duration: 0.3,
      opacity: { duration: 0.2 },
    },
  },
};
