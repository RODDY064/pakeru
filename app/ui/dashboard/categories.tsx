import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function Category({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    image: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { get, post, del } = useApiClient();

  const {
    loadCategories,
    categories,
    createCategory,
    deleteCategory,
    isCategoriesLoading,
  } = useBoundStore();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    console.log(selectedCategory);
  }, [selectedCategory]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only WebP
    if (file.type !== "image/webp") {
      setError("Please select a WebP image file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (2MB max for WebP)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("Image size should be less than 2MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Create preview and validate dimensions
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        // Validate dimensions - must be exactly 1024x1024
        if (img.width === 1024 || img.height === 1024) {
          setError("Image must be exactly 1024 x 1024 pixels");
          setFormData((prev) => ({ ...prev, image: null }));
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        // All validations passed
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, image: file }));
        setError(null);
      };
      img.onerror = () => {
        setError("Failed to load image");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };


  // Handle adding a new category
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    // Check if category already exists
    if (
      categories.find(
        (cat) => cat.name.toLowerCase() === formData.name.toLowerCase().trim()
      )
    ) {
      setError("Category already exists");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      if (formData.parentCategory) {
        formDataToSend.append("parentCategory", formData.parentCategory);
      }
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const newCategory = await createCategory(formDataToSend, post);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        parentCategory: "",
        image: null,
      });
      setImagePreview(null);
      setShowForm(false);

      // Optionally select the newly created category
      setSelectedCategory(newCategory._id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteCategory(categoryToDelete, del);

      // If the deleted category was selected, reset selection
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory("");
      }

      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "",
      image: null,
    });
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    console.log(selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <p className="font-avenir font-[500] text-lg">Category</p>
          <div className="flex items-center gap-2 relative">
            <p className="font-avenir font-[500] text-sm hidden lg:flex">
              Add Category
            </p>
            <div
              onClick={() => setShowForm((prev) => !prev)}
              className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer"
            >
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
          >
            <option value="">Select category</option>
            {categories?.map((cat, index) => (
              <option key={index} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3">
            <Image src="/icons/arrow.svg" width={16} height={16} alt="arrow" />
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showForm && (
        <div className="fixed overflow-auto pb-24 z-20 w-full h-full bg-black/80 top-0 left-0 flex flex-col items-center pt-24 font-avenir">
          <div className="w-[60%] xl:w-[40%] h-fit bg-white p-10 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="font-avenir text-lg font-semibold">Add Category</p>
              <div
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex gap-1 items-center cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
                  <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
                </div>
                <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
              </div>
            </div>

             {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-3xl text-sm">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="mt-4 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".webp,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <div
                onClick={() => !imagePreview && fileInputRef.current?.click()}
                className="w-full flex-nowrap flex-none h-[300px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px] overflow-hidden cursor-pointer relative"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain bg-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      disabled={isLoading}
                      className="absolute top-4 right-4 border border-red-500 border-dotted cursor-pointer rounded-full p-2  transition-colors disabled:opacity-50"
                    >
                      <Image
                        src="/icons/delete.svg"
                        width={20}
                        height={20}
                        alt="Remove"
                       
                      />
                    </button>
                  </>
                ) : (
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
                    <div className="text-center">
                      <p className="text-sm font-medium text-black/60">
                        Click to upload image
                      </p>
                      <p className="text-xs text-black/40 mt-1">
                        WebP only, 1024 x 1024 pixels, max 2MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter category name"
                  className="w-full border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-lg h-12 px-3 focus:outline-none focus-within:border-black/30"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-lg px-3 py-2 focus:outline-none focus-within:border-black/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: "",
                    description: "",
                    parentCategory: "",
                    image: null as File | null,
                  });
                  setError(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg cursor-pointer hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? "Adding..." : "Add Category"}
              </button>
            </div>

            {/* Manage Categories Section */}
            <div className="my-8">
              <p className="font-medium mb-2">Manage Categories</p>
              <div className="border flex flex-col border-black/20 rounded-lg overflow-hidden">
                {categories?.length === 0 ? (
                  <div className="p-4 text-center text-black/50">
                    No categories found
                  </div>
                ) : (
                  categories?.map((cat, index) => (
                    <div
                      key={index}
                      className={`w-full h-12 flex items-center justify-between ${
                        index % 2 === 0 ? "bg-black/10" : "bg-transparent"
                      }`}
                    >
                      <div className="flex-1 px-4">
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-black/60">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div className="px-4 border-l border-black/20 h-full flex items-center justify-center">
                        <Image
                          src="/icons/delete.svg"
                          width={20}
                          height={20}
                          alt="delete"
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => handleDeleteCategory(cat._id)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-30 w-full h-full bg-black/80 top-0 left-0 flex items-center justify-center font-avenir">
          <div className="w-[400px] bg-white p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
            <p className="text-black/70 mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg cursor-pointer hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-red-500 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
