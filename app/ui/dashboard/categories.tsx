// import { useBoundStore } from "@/store/store";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";

// export default function Category({
//   selectedCategory,
//   setSelectedCategory,
// }: {
//   selectedCategory: string;
//   setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
// }) {
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     parentCategory: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [newCategory, setNewCategory] = useState("");
//   const { loadCategories, categories } = useBoundStore();

//   useEffect(() => {
//     loadCategories();
//   }, [loadCategories]);

//   // const handleAddCategory = () => {
//   //   if (!newCategory.trim()) return;
//   //   if (categories.includes(newCategory.trim())) {
//   //     return;
//   //   }
//   //   setCategoriesForm((prev) => [...prev, newCategory.trim()]);
//   //   setSelectedCategory(newCategory.trim());
//   //   setNewCategory("");
//   //   setShowForm(false);
//   // };

//   useEffect(()=>{ console.log(selectedCategory)},[selectedCategory])

//   return (
//     <>
//       <div>
//         <div className="flex justify-between items-center">
//           <p className="font-avenir font-[500] text-lg ">Category</p>
//           <div className="flex items-center gap-2 relative">
//             <p className="font-avenir font-[500] text-sm hidden lg:flex">
//               Add Category
//             </p>
//             <div
//               onClick={() => setShowForm((prev) => !prev)}
//               className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer">
//               <Image
//                 src="/icons/plus-w.svg"
//                 width={16}
//                 height={16}
//                 alt="plus"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="relative mt-2 flex items-center">
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl">
//             <option value="">Select category</option>
//             {categories?.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//           <div className="absolute right-3">
//             <Image src="/icons/arrow.svg" width={16} height={16} alt="arrow" />
//           </div>
//         </div>
//       </div>
//       {showForm && <div className="fixed z-20 w-full h-full bg-black/80 top-0 left-0 flex flex-col items-center pt-36">
//         <div className="w-[40%] min-h-[400px] bg-white p-10 rounded-2xl">
//              <div className="flex items-center justify-between">
//                 <p className="font-avenir text-lg font-semibold">Add Category</p>
//                 <div onClick={()=>setShowForm(!showForm)} className="flex gap-1 items-center cursor-pointer ">
//                     <div className="relative flex items-center justify-center">
//                         <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
//                         <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
//                     </div>
//                     <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
//                 </div>
//                 </div>
//           <div className="my-4 flex gap-2 items-center h-12">
//             <input
//               placeholder="Enter category name"
//               className="w-[70%] border placeholder:text-black/30 text-md border-black/10 bg-black/5 rounded-lg h-full   px-3 focus:outline-none focus-within:border-black/30"
//             />
//             <p className="w-[30%] cursor-pointer h-full bg-black text-white rounded-lg flex items-center justify-center font-avenir text-lg">
//               Add
//             </p>
//           </div>
//           <div className="my-8">
//             <p>Manage Categories</p>
//             <div className="mt-2  border flex flex-col border-black/20 ">
//               {categories?.map((cat, index) => (
//                 <div
//                   key={cat.id}
//                   className={`w-full h-12 flex items-center justify-between ${
//                     index % 2 === 0 ? "bg-black/10" : "bg-transparent"
//                   }`}>
//                   <p className="p-3 px-4">{cat.name}</p>
//                   <div className="px-10 border-l  border-black/20 h-full flex items-center justify-center">
//                     <Image
//                       src="/icons/delete.svg"
//                       width={20}
//                       height={20}
//                       alt="delete"
//                       className="cursor-pointer"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       }
//     </>
//   );
// }

// //    {showForm && (
// //             <div className="absolute w-[180px] h-fit pb-4 bg-white shadow-2xl border border-black/20 rounded-2xl bottom-6 right-4 p-3">
// //               <p className="font-avenir text-lg">Category</p>
// //               <input
// //                 value={newCategory}
// //                 onChange={(e) => setNewCategory(e.target.value)}
// //                 placeholder="Enter category name"
// //                 className="w-full border placeholder:text-black/30 text-sm border-black/10 bg-black/5 rounded-lg mt-2 h-8 p-2 focus:outline-none focus-within:border-black/30"
// //               />

// //               <div className="flex gap-2 mt-4 w-full font-avenir ">
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setNewCategory("");
// //                     setShowForm(false);
// //                   }}
// //                   className="w-full px-3 py-0.5 text-sm border border-black/20 rounded-md hover:bg-black/5 transition-colors"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="button"
// //                   // onClick={handleAddCategory}
// //                   className=" w-full px-3 py-0.5 text-sm bg-black text-white rounded-md hover:bg-black/80 transition-colors"
// //                 >
// //                   Add
// //                 </button>
// //               </div>
// //             </div>
// //           )}


import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    loadCategories, 
    categories, 
    createCategory, 
    deleteCategory,
    isCategoriesLoading 
  } = useBoundStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    console.log(selectedCategory);
  }, [selectedCategory]);

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    // Check if category already exists
    if (categories.find(cat => cat.name.toLowerCase() === formData.name.toLowerCase().trim())) {
      setError("Category already exists");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCategory = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentCategory: formData.parentCategory || null,
      });
      
      // Reset form and close modal
      setFormData({ name: "", description: "", parentCategory: "" });
      setShowForm(false);
      
      // Optionally select the newly created category
      setSelectedCategory(newCategory.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
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
      await deleteCategory(categoryToDelete);
      
      // If the deleted category was selected, reset selection
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory("");
      }
      
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleSet = (e:any)=>{
    // find the id and set tje selSelectedCatgory as id 
    setSelectedCategory(e.target.value)
  }

  useEffect(()=>{
    console.log(selectedCategory)
  },[selectedCategory])

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
              className="size-6 bg-black rounded-full flex items-center justify-center cursor-pointer">
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
            className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl">
            <option value="">Select category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
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
        <div className="fixed z-20 w-full h-full bg-black/80 top-0 left-0 flex flex-col items-center pt-24 font-avenir">
          <div className="w-[40%] min-h-[400px] bg-white p-10 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="font-avenir text-lg font-semibold">Add Category</p>
              <div
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", description: "", parentCategory: "" });
                  setError(null);
                }}
                className="flex gap-1 items-center cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
                  <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
                </div>
                <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  setFormData({ name: "", description: "", parentCategory: "" });
                  setError(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg cursor-pointer hover:bg-black/5 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center">
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
                      key={cat.id}
                      className={`w-full h-12 flex items-center justify-between ${
                        index % 2 === 0 ? "bg-black/10" : "bg-transparent"
                      }`}>
                      <div className="flex-1 px-4">
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-black/60">{cat.description}</p>
                        )}
                      </div>
                      <div className="px-4 border-l border-black/20 h-full flex items-center justify-center">
                        <Image
                          src="/icons/delete.svg"
                          width={20}
                          height={20}
                          alt="delete"
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => handleDeleteCategory(cat.id)}
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
              Are you sure you want to delete this category? This action cannot be undone.
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
                className="flex-1 px-4 py-2 border border-black/20 rounded-lg cursor-pointer hover:bg-black/5 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-red-500 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 cursor-pointer transition-colors disabled:opacity-50">
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}