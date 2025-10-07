import { useApiClient } from "@/libs/useApiClient";
import { CategoryType } from "@/store/category";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
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
  const { post, patch } = useApiClient();
  const [addNewParentCategory, setAddNewParentCategory] = useState(false);

  const {
    loadCategories,
    categories,
    createCategory,
    updateCategory,
    isCategoriesLoading,
  } = useBoundStore();

  useEffect(() => {
    loadCategories();
  }, []);

  const groupCategories = useMemo(() => {
    const groups: Record<string, CategoryType[]> = {};
    const ungrouped: CategoryType[] = [];

    categories.forEach((item) => {
      if (item.parentCategory) {
        const parent = item.parentCategory;
        if (!groups[parent]) {
          groups[parent] = [];
        }
        groups[parent].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    return { groups, ungrouped };
  }, [categories]);

  useEffect(() => {
    if (!selectedCategory) return;
    const selectedCatObj = categories.find(
      (cat) => cat._id === selectedCategory
    );

    if (selectedCatObj) {
      if (selectedCatObj.parentCategory) {
        setSelectedParentCategory(selectedCatObj.parentCategory);
      } else {
        setSelectedParentCategory("");
      }
    }
  }, [selectedCategory, categories]);

  const parentCategories = useMemo(() => {
    const uniqueParents = new Set<string>();
    categories.forEach((cat) => {
      if (cat.parentCategory) {
        uniqueParents.add(cat.parentCategory);
      }
    });
    return Array.from(uniqueParents);
  }, [categories]);

  const subcategories = useMemo(() => {
    if (!selectedParentCategory) return categories;
    return categories.filter(
      (cat) => cat.parentCategory === selectedParentCategory
    );
  }, [categories, selectedParentCategory]);

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
        console.log(img.width, img.height);
        // Validate dimensions - must be exactly 1024x1024
        if (img.width !== 1024 || img.height !== 1024) {
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
  const handleSubmitCategory = async () => {
    if (!formData.name.trim()) {
      setError("Subcategory name is required");
      return;
    }

    if (!addNewParentCategory && !formData.parentCategory) {
      setError("Please select a parent category or create a new one");
      return;
    }

    // Check if category already exists (only when creating new)
    if (
      !editingCategoryId &&
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

      // Use the parent category from the form
      if (formData.parentCategory) {
        formDataToSend.append("parentCategory", formData.parentCategory);
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingCategoryId) {
        // Update existing category
        await updateCategory(editingCategoryId, formDataToSend, patch);
      } else {
        // Create new category
        const newCategory = await createCategory(formDataToSend, post);
        setSelectedCategory(newCategory._id);

        if (formData.parentCategory) {
          setSelectedParentCategory(formData.parentCategory);
        }

        // Select the new subcategory
        setSelectedCategory(newCategory._id);
      }

      // Reset form and close modal
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingCategoryId ? "update" : "create"} category`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    const categoryToEdit = categories.find((cat) => cat._id === categoryId);
    if (!categoryToEdit) return;

    // Load category data into form
    setEditingCategoryId(categoryId);
    setFormData({
      name: categoryToEdit.name,
      description: categoryToEdit.description || "",
      parentCategory: categoryToEdit.parentCategory || "",
      image: null, // Don't load existing image as File
    });

    if (categoryToEdit.image && categoryToEdit.image.url) {
      setImagePreview(categoryToEdit.image.url);
    }

    // Determine if parent category is custom or from list
    if (
      categoryToEdit.parentCategory &&
      !parentCategories.includes(categoryToEdit.parentCategory)
    ) {
      setAddNewParentCategory(true);
    }

    setShowForm(true);
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
    setAddNewParentCategory(false);
    setEditingCategoryId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div>
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

          <p className="font-avenir font-[500] text-md pt-3 pb-2 text-black/70">
            Parent Category
          </p>

          <div className="relative  flex items-center">
            <select
              value={selectedParentCategory}
              onChange={(e) => {
                setSelectedParentCategory(e.target.value);
                setSelectedCategory("");
              }}
              className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
            >
              <option value="">Select parent category</option>
              {parentCategories.map((parent, index) => (
                <option key={index} value={parent}>
                  {parent}
                </option>
              ))}
            </select>
            <div className="absolute right-3">
              <Image
                src="/icons/arrow.svg"
                width={16}
                height={16}
                alt="arrow"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center pt-4 pb-2">
            <p className="font-avenir font-[500] text-md text-black/70">
              Sub-category
            </p>
          </div>
          <div className="relative flex items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedParentCategory}
              className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
            >
              <option value="">
                {selectedParentCategory
                  ? "Select subcategory"
                  : "Select parent category first"}
              </option>
              {subcategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3">
              <Image
                src="/icons/arrow.svg"
                width={16}
                height={16}
                alt="arrow"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Add Category Modal */}
      {showForm && (
        <div className="fixed overflow-auto pb-24 z-20 w-full h-full bg-black/80 top-0 left-0 flex flex-col items-center pt-24 font-avenir">
          <div className="w-[60%] xl:w-[40%] h-fit bg-white p-10 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="font-avenir text-lg font-semibold">
                {editingCategoryId ? "Edit Category" : "Add Category"}
              </p>
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
                      type="button"
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
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <p
                    onClick={() =>
                      setAddNewParentCategory(!addNewParentCategory)
                    }
                    className="text-sm font-avenir text-blue-600 cursor-pointer hover:underline"
                  >
                    {addNewParentCategory ? "Select existing" : "Add new"}
                  </p>
                </div>
                {addNewParentCategory ? (
                  <input
                    value={formData.parentCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentCategory: e.target.value,
                      }))
                    }
                    placeholder="Enter parent category name (e.g., Male, Female)"
                    className="w-full border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-lg h-12 px-3 focus:outline-none focus-within:border-black/30"
                    disabled={isLoading}
                  />
                ) : (
                  <select
                    value={formData.parentCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentCategory: e.target.value,
                      }))
                    }
                    className="w-full h-12 font-avenir p-2 px-3 appearance-none border text-sm border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
                    disabled={isLoading}
                  >
                    <option value="">Select parent category</option>
                    {parentCategories.map((parent, index) => (
                      <option key={index} value={parent}>
                        {parent}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter subcategory name"
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
                  className="w-full border placeholder:text-black/30  text-md border-black/10 bg-black/5 rounded-lg px-3 py-2 focus:outline-none focus-within:border-black/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg cursor-pointer hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCategory}
                disabled={
                  isLoading ||
                  !formData.name.trim() ||
                  (!addNewParentCategory &&
                    !formData.parentCategory &&
                    !formData.image)
                }
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading
                  ? editingCategoryId
                    ? "Updating..."
                    : "Adding..."
                  : editingCategoryId
                  ? "Update Category"
                  : "Add Category"}
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
                  <div>
                    {Object.entries(groupCategories.groups).map(
                      ([parent, items]) => (
                        <div
                          key={parent}
                          className="border-b border-black/10 last:border-b-0"
                        >
                          <div className="flex items-center justify-between py-3 px-4 border-b border-black/20 font-medium">
                            <p className="font-avenir">{parent}</p>
                          </div>
                          {items.map((cat, index) => (
                            <div
                              key={cat._id}
                              className={`w-full min-h-12 p-2 pl-8 flex items-center justify-between hover:bg-black/5 transition-colors ${
                                index % 2 === 0
                                  ? "bg-black/10"
                                  : " bg-transparent"
                              }`}
                            >
                              <div className="flex-1 px-4">
                                <p className="font-medium">{cat.name}</p>
                                {cat.description && (
                                  <p className="text-xs text-black/60 mt-1">
                                    {cat.description}
                                  </p>
                                )}
                              </div>
                              <div className="px-4 border-l border-black/20 h-full flex items-center justify-center">
                                <Image
                                  src="/icons/edit-cat.svg"
                                  width={20}
                                  height={20}
                                  alt="delete"
                                  className="cursor-pointer hover:opacity-70 transition-opacity"
                                  onClick={() => handleEditCategory(cat._id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                    <div className="flex items-center justify-between py-3 px-4 border-b border-black/20 font-medium">
                      <p className="font-avenir text-black/30">
                        Ungroup Category
                      </p>
                    </div>
                    {groupCategories.ungrouped.map((cat, index) => (
                      <div
                        key={cat._id}
                        className={`w-full min-h-12 p-2 pl-8 flex items-center justify-between hover:bg-black/5 transition-colors ${
                          index % 2 === 0 ? "bg-black/10" : " bg-transparent"
                        }`}
                      >
                        <div className="flex-1 px-4">
                          <p className="font-medium">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-black/60 mt-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <div className="px-4 border-l border-black/20 h-full flex items-center justify-center">
                          <Image
                            src="/icons/edit-cat.svg"
                            width={20}
                            height={20}
                            alt="delete"
                            className="cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => handleEditCategory(cat._id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
