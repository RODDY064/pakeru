"use client";

import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { UseFormSetValue, FieldErrors } from "react-hook-form";

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

interface ClothTypeModalProps {
  selectedClothType?: string; 
  errors?: any;
  setValue: UseFormSetValue<any>;
  register: any;
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

export default function ClothTypeModal({
  selectedClothType,
  errors,
  setValue,
  register,
}: ClothTypeModalProps) {
  const [showClothModal, setShowClothModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingClothType, setEditingClothType] = useState<ClothType | null>(null);
  const [clothError, setClothError] = useState<string | null>(null);
  const [selectedSizeType, setSelectedSizeType] = useState<SizeType>("men-tops");
  const [clothName, setClothName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sizeGuideRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { get, patch, post } = useApiClient();
  const { loadClothTypes, clothTypes, createClothTypes, updateClothTypes } =
    useBoundStore();

  useEffect(() => {
    loadClothTypes(get);
  }, [get, loadClothTypes]);

  useEffect(() => {
    if (
      showEditPanel &&
      selectedSizeType &&
      sizeGuideRefs.current[selectedSizeType]
    ) {
      setTimeout(() => {
        sizeGuideRefs.current[selectedSizeType]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 400);
    }
  }, [showEditPanel, selectedSizeType]);

  const handleEdit = useCallback((clothType?: ClothType) => {
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
    setShowEditPanel(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!showEditPanel) {
      setShowClothModal(false);
    }
    setShowEditPanel(false);
    setEditingClothType(null);
    setClothName("");
    setSelectedSizeType("men-tops");
    setClothError(null);
  }, [showEditPanel]);

  const handleSave = async () => {
    if (!clothName.trim()) {
      setClothError("Please enter a cloth type name");
      return;
    }

    setIsSubmitting(true);
    setClothError(null);

    try {
      const data = {
        name: clothName.trim(),
        sizeGuideType: selectedSizeType,
      };

      if (editingClothType?._id) {
        const success = await updateClothTypes(
          editingClothType._id,
          data,
          patch
        );
        if (success) {
          setShowEditPanel(false);
          setEditingClothType(null);
          setClothName("");
          setSelectedSizeType("men-tops");
          await loadClothTypes(get);
        }
      } else {
        const success = await createClothTypes(data, post);
        if (success) {
          setShowEditPanel(false);
          setEditingClothType(null);
          setClothName("");
          setSelectedSizeType("men-tops");
          await loadClothTypes(get);
        }
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

  const getSizeTypeLabel = useCallback((sizeType: string) => {
    if (!sizeType) return "";

    const normalized = sizeType.toLowerCase().replace(/_/g, "-");
    const option = sizeTypeOptions.find((opt) => opt.id === normalized);
    return option ? option.label : sizeType.replace(/_/g, " ").toUpperCase();
  }, []);

  const handleCreateNew = useCallback(() => {
    setEditingClothType(null);
    setClothName("");
    setSelectedSizeType("men-tops");
    setClothError(null);
    setShowEditPanel(true);
  }, []);

  // Update parent form when cloth type changes in modal
  useEffect(() => {
    if (selectedClothType) {
      setValue("sizeType.clothType", selectedClothType, { 
        shouldValidate: true 
      });
    }
  }, [selectedClothType, setValue]);

  return (
    <>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <p className="font-avenir font-[500] text-lg">Cloth Type</p>
          <div className="flex items-center gap-2 relative">
            <p className="font-avenir font-[500] text-sm hidden lg:flex">
              Manage types
            </p>
            <button
              type="button"
              onClick={() => setShowClothModal(true)}
              className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
              aria-label="Manage cloth types"
            >
              <Image
                src="/icons/plus-w.svg"
                width={16}
                height={16}
                alt=""
              />
            </button>
          </div>
        </div>

        <div className="relative mt-2 flex items-center">
          <select
            {...register("sizeType.clothType")}
            className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
          >
            <option value="">Select cloth type</option>
            {clothTypes.map((cloth) => (
              <option key={cloth._id} value={cloth._id}>
                {cloth.name}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none">
            <Image src="/icons/arrow.svg" width={16} height={16} alt="" />
          </div>
        </div>
        
        {errors?.sizeType?.clothType && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sizeType.clothType.message}
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
            key="manage-modal"
            className="fixed w-full h-full inset-0 flex justify-center items-center z-[99] overflow-auto py-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => {
                if (!showEditPanel) {
                  handleCloseModal();
                }
              }}
            />
            <div className="w-[90%] md:w-[60%] xl:w-[40%] min-h-[400px] max-h-[90vh] bg-white py-6 relative z-20 rounded-3xl flex flex-col">
              <div className="flex items-center justify-between border-b border-black/30 px-8 pb-4">
                <p className="font-semibold text-lg">Manage Cloth Types</p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex gap-1 items-center cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="Close modal"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
                    <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
                  </div>
                  <p className="font-avenir text-sm pt-1 text-black/60">
                    CLOSE
                  </p>
                </button>
              </div>

              <div className="p-8 pt-6 overflow-auto flex-1">
                <div className="w-full border border-black/30 flex flex-col rounded-2xl overflow-hidden">
                  {clothTypes.length === 0 ? (
                    <div className="w-full py-4 bg-black/10 px-6 flex items-center justify-center">
                      <p className="font-avenir text-md text-black/50">
                        No cloth types available
                      </p>
                    </div>
                  ) : (
                    clothTypes.map((cloth, index) => (
                      <div
                        key={cloth._id}
                        className={`w-full py-4 px-6 flex items-center justify-between ${
                          index % 2 === 0 ? "bg-black/10" : "bg-transparent"
                        } ${
                          index < clothTypes.length - 1
                            ? "border-b border-black/30"
                            : ""
                        }`}
                      >
                        <div>
                          <h2 className="font-avenir text-md">{cloth.name}</h2>
                          <p className="text-sm font-avenir text-black/50">
                            {getSizeTypeLabel(cloth.sizeGuideType)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEdit(cloth)}
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                          aria-label={`Edit ${cloth.name}`}
                        >
                          <Image
                            src="/icons/edit-cat.svg"
                            width={20}
                            height={20}
                            alt=""
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3 mt-10">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex-1 h-12 bg-black text-white rounded-xl font-avenir cursor-pointer font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create cloth type
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 h-12 border border-black/20 text-black rounded-xl cursor-pointer font-avenir font-medium hover:bg-black/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showEditPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 flex justify-end w-full h-full overflow-auto z-[100] bg-black/80"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal();
            }}
          >
            <motion.div
              variants={container}
              initial="close"
              animate="open"
              exit="close"
              className="relative w-full md:w-[70%] lg:w-[50%] h-full bg-white overflow-hidden flex flex-col"
            >
              <div className="border-b border-black/30 px-6 md:px-10 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-avenir text-lg md:text-xl font-semibold">
                    {editingClothType ? "Edit Cloth Type" : "Create Cloth Type"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex gap-1 items-center cursor-pointer hover:opacity-70 transition-opacity"
                    aria-label="Close panel"
                  >
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
                    className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-2xl text-sm"
                  >
                    {clothError}
                  </motion.div>
                )}
              </div>

              <div className="flex-1 overflow-auto px-6 md:px-10 pt-6 pb-6">
                <div className="space-y-6">
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
                      placeholder="e.g., Cotton T-Shirt"
                      className="w-full border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-xl h-12 px-3 focus:outline-none focus:border-black/30 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-md font-medium font-avenir mb-4">
                      Select Size Guide Template
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sizeTypeOptions.map((option) => (
                        <div key={option.id} className="w-full">
                          <button
                            type="button"
                            onClick={() => setSelectedSizeType(option.id)}
                            className="flex gap-3 items-center mb-3 group w-full text-left"
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
                                  ? "text-black"
                                  : "text-black/60 group-hover:text-black/80"
                              }`}
                            >
                              {option.label}
                            </p>
                          </button>
                          <div
                            className={`aspect-fit w-full border relative rounded-xl overflow-hidden transition-all ${
                              selectedSizeType === option.id
                                ? "border-black border-2"
                                : "border-black/20"
                            }`}
                          >
                            <Image
                              src={option.image}
                              width={400}
                              height={600}
                              alt={option.label}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 px-6 md:px-10 py-6">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-black text-white rounded-xl font-avenir cursor-pointer font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingClothType
                      ? "Update"
                      : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 h-12 border border-black/20 text-black rounded-xl cursor-pointer font-avenir font-medium hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}