import { capitalize } from "@/libs/functions";
import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function AttachPicker({
  type,
}: {
  type: "products" | "categories";
}) {
  const [manageTable, setManageTabel] = useState(false);

  return (
    <>
      <div className="my-4 mb-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="font-avenir text-lg">{capitalize(type)}</label>
            <div className="size-8 bg-black flex items-center justify-center rounded-full gap.0.5">
              <div className="relative flex items-center justify-center">
                <div className="w-[6px] h-[1px] bg-white"></div>
                <div className="w-[1px] h-[6px] bg-white absolute"></div>
              </div>
              <p className="font-avenir text-sm text-white ">3</p>
            </div>
          </div>
          <div
            onClick={() => setManageTabel(true)}
            className="mx-4 font-avenir text-md cursor-pointer text-blue-600"
          >
            Manage table
          </div>
        </div>
        <div className="mt-2 w-full border  rounded-2xl border-black/20 overflow-hidden">
          <div className="w-full   flex font-avenir">
            <p className="h-full p-3.5 border-r border-black/20 px-6">0</p>
            <p className="h-full p-3.5 px-4">Untitle Product</p>
          </div>
        </div>
      </div>
      {manageTable && (
        <MangeTable type={type} setManageTabel={setManageTabel} />
      )}
    </>
  );
}

// const MangeTable = ({
//   type,
//   setManageTabel,
// }: {
//   type: "products" | "categories";
//   setManageTabel: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const { loadProducts, products, cartState,isCategoriesLoading, loadCategories  } = useBoundStore();
//   const { get } = useApiClient();
  

//   useEffect(() => {
//     loadProducts(false, 1);
//   }, []);

//   return (
//     <div className="fixed top-0 left-0 bg-black/90 z-90 w-full h-full flex flex-col items-center justify-center">
//       <div className="w-[40%] h-[50vh] bg-white p-10 rounded-4xl">
//         <div className="flex items-center justify-between">
//           <p className="font-avenir text-lg font-semibold">
//             Manage {type === "products" ? "Product" : "Category"}
//           </p>
//           <div
//             onClick={() => setManageTabel(false)}
//             className="flex gap-1 items-center cursor-pointer"
//           >
//             <div className="relative flex items-center justify-center">
//               <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
//               <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
//             </div>
//             <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
//           </div>
//         </div>
//         <div className="mt-4 h-[70%]">
//           <input
//             placeholder={`Search for ${type}`}
//             className="w-full h-12 border border-black/20 p-3 px-4 font-avenir rounded-xl mt-2 focus:outline-none"
//           />
//           <div className="w-full   mt-6 h-full  border-t-[2px] border-black/20">
//             {(cartState === "loading" || cartState === "idle") && (
//               <>
//                 <div className="w-full h-24 flex items-center justify-center pt-6">
//                   <Image
//                     src="/icons/loader.svg"
//                     width={24}
//                     height={24}
//                     alt="laoding icon"
//                   />
//                 </div>
//               </>
//             )}
//             {cartState === "success" && (
//               <>
//                 <div className="w-full h-[85%] overflow-auto  mt-6 border rounded-2xl border-black/20">
//                   {products.map((product,index) => (
//                     <div key={product._id} className={`flex  justify-between ${index === products.length -1 ? "":"border-b border-black/20"}`}>
//                       <div className="flex">
//                         <div className="p-3 px-6 border-r border-black/30">
//                           <p className="font-avenir text-md">{index + 1}</p>
//                         </div>
//                         <div className="p-3   px-6 items-center gap-3 flex">
//                           <div className="size-10 rounded-md relative border border-black/20 overflow-hidden">
//                             <Image src={product.mainImage.url} fill className="object-cover" sizes="100vw" alt={product.name}/>
//                           </div>
//                           <p className="font-avenir text-md">{product.name}</p>
//                         </div>
//                       </div>
//                       <div className="p-3 px-6 border-l border-black/30 flex items-center justify-center">
//                         <div className="size-5 border cursor-pointer rounded-full p-[2px]">
//                           <div className="size-full rounded-full bg-black"></div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const MangeTable = ({
  type,
  setManageTabel,
}: {
  type: "products" | "categories";
  setManageTabel: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    loadProducts,
    loadCategories,
    products,
    categories,
    cartState,
    isCategoriesLoading,
  } = useBoundStore();

  const [searchTerm, setSearchTerm] = useState("");
  const { get } = useApiClient()
 
  useEffect(() => {
    if (type === "products") {
      loadProducts(false, 1,25,{});
    } else {
      loadCategories();
    }
  }, [type, loadProducts, loadCategories]);

  // Pick state dynamically
  const isLoading =
    (type === "products" && (cartState === "loading" || cartState === "idle")) ||
    (type === "categories" && isCategoriesLoading);

  const data = type === "products" ? products : categories;

  // Filter based on search term
  const filteredData = data.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed top-0 left-0 bg-black/90 z-90 w-full h-full flex flex-col items-center justify-center">
      <div className="w-[40%] h-[50vh] bg-white p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-avenir text-lg font-semibold">
            Manage {type === "products" ? "Product" : "Category"}
          </p>
          <div
            onClick={() => setManageTabel(false)}
            className="flex gap-1 items-center cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
              <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
            </div>
            <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-4 h-[70%]">
          <input
            placeholder={`Search for ${type}`}
            className="w-full h-12 border border-black/20 p-3 px-4 font-avenir rounded-xl mt-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="w-full mt-6 h-full border-t-[2px] border-black/20">
            {isLoading && (
              <div className="w-full h-24 flex items-center justify-center pt-6">
                <Image
                  src="/icons/loader.svg"
                  width={24}
                  height={24}
                  alt="loading icon"
                />
              </div>
            )}

            {!isLoading && (
              <div className="w-full h-[85%] overflow-auto mt-6 border rounded-2xl border-black/20">
                {filteredData.length > 0 ? (
                  filteredData.map((item: any, index: number) => (
                    <div
                      key={item._id}
                      className={`flex justify-between border-b border-black/20 `}
                    >
                      <div className="flex">
                        <div className="p-3 px-6 border-r border-black/30">
                          <p className="font-avenir text-md">{index + 1}</p>
                        </div>
                        <div className="p-3 px-6 items-center gap-3 flex">
                          {type === "products" && (
                            <div className="size-10 rounded-md relative border border-black/20 overflow-hidden">
                              <Image
                                src={item.mainImage.url}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                alt={item.name}
                              />
                            </div>
                          )}
                          <p className="font-avenir text-md">{item.name}</p>
                        </div>
                      </div>
                      <div className="p-3 px-6 border-l border-black/30 flex items-center justify-center">
                        <div className="size-5 border cursor-pointer rounded-full p-[2px]">
                          <div className="size-full rounded-full bg-black"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-24 flex items-center justify-center">
                    <p className="text-black/50 font-avenir">
                      No {type} found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};