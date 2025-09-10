"use client";
import Checkbox from "@/app/ui/dashboard/checkbox";
import Pagination from "@/app/ui/dashboard/pagination";
import { cn } from "@/libs/cn";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Products() {
  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8 pb-36   xl:ml-[15%] pt-20  md:pt-24 md:pb-32">
      <div className="flex items-center justify-between max-sm:px-3">
        <p className="font-avenir text-xl md:text-2xl font-bold">Products</p>
        <Link
          href="/store-products/product-actions"
          className="p-1.5 sm:px-3  md:py-2  bg-black flex items-center gap-2 cursor-pointer rounded-full md:rounded-lg"
        >
          <p className="font-avenir text-sm font-[500] text-white mt-[3px] sm:flex hidden">
            Create Product
          </p>
          <Image
            src="/icons/plus-w.svg"
            width={18}
            height={18}
            alt="plus"
            className="hidden sm:flex"
          />
          <Image
            src="/icons/plus-w.svg"
            width={16}
            height={16}
            alt="plus"
            className="sm:hidden "
          />
        </Link>
      </div>
      <StatsCard />
      <Tables />
      <MobileTabs />
    </div>
  );
}

function StatsCard() {
  const { getProductStats } = useBoundStore();

  const productStats = useMemo(() => getProductStats(), [getProductStats]);

  const [stats, setStats] = useState([
    { label: "Product Sells Rate", value: 0 },
    { label: "Total Products", value: 0 },
    { label: "Active Products", value: 0 },
    { label: "Inactive Products", value: 0 },
    { label: "Product Out of Stock", value: 0 },
  ]);

  useEffect(() => {
    if (!productStats) return;

    setStats([
      { label: "Product Sells Rate", value: 0 },
      { label: "Total Products", value: productStats.total ?? 0 },
      { label: "Active Products", value: productStats.active ?? 0 },
      { label: "Inactive Products", value: productStats.inactive ?? 0 },
      { label: "Product Out of Stock", value: productStats.outOfStock ?? 0 },
    ]);
  }, [productStats]);

  return (
    <div className="mt-4 w-full h-fit bg-white border border-black/15  sm:rounded-2xl grid grid-cols-2 md:flex md:px-4 ">
      {stats.map((item, index) => (
        <div
          key={index}
          className={cn(
            "w-full flex items-start border-r max-sm:border-t border-black/10 py-2.5 px-4 lg:px-5 xl:px-10 flex-col last:border-r-0",
            {
              "col-span-2 ": index === stats.length - 1,
            }
          )}>
          <p className="font-avenir font-[500] text-sm md:text-md md:mt-[2px] text-black/60">
            {`${item.label}`}
          </p>
          <div className="w-full border-[0.5px] border-dashed border-black/50 mt-1" />
          <p className="font-avenir font-semibold md:text-xl mx-1 mt-2 text-black/70">
            {`${item.value} ${item.label === "Product Sells Rate" ? "%" : ""} `}
          </p>
        </div>
      ))}
    </div>
  );
}

const Tables = () => {
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const [currentPageProducts, setCurrentPageProducts] = useState<ProductData[]>(
    []
  );
  const [categoriesSelect, setCategoriesSelect] = useState<string[]>([]);
  const router = useRouter();

  const {
    storeProductFilters,
    setStoreProductFilters,
    filteredStoreProducts,
    storeProducts,
    loadStoreProducts,
    dashboardProductLoading,
    dashboardProductErrors,
    getPaginatedSlice,
    setPaginationConfig,
    updatePaginationFromAPI,
    pagination,
    categories,
    loadCategories,
    setSelectedProduct,
    getCategoryNameById,
  } = useBoundStore();

  useEffect(() => {
    loadStoreProducts(true);
    loadCategories();
  }, []);

  useEffect(() => {
    const catNames = categories.map((cat) => cat.name);
    setCategoriesSelect(catNames);
  }, [categories]);

  useEffect(() => {
    setPaginationConfig({
      dataKey: "storeProducts",
      loadFunction: "loadProducts",
      itemsPerPage: 10,
      backendItemsPerPage: 10,
    });
  }, []);

  useEffect(() => {
    updatePaginationFromAPI({
      totalItems: filteredStoreProducts.length,
      currentBackendPage: 1,
    });
  }, [storeProducts, filteredStoreProducts]);

  useEffect(() => {
    const sliceData = getPaginatedSlice(filteredStoreProducts);
    setCurrentPageProducts(sliceData);
  }, [pagination, storeProductFilters, storeProducts]);

  // useEffect(() => {
  //   console.log(currentPageProducts, "current pagination");
  // }, [currentPageProducts]);

  // Synchronize scroll between header and content
  const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget?.scrollLeft;
    }
  };

  const scrollTable = (turn: "right" | "left") => {
    const container = headerScrollRef.current || contentScrollRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const totalWidth = container.scrollWidth;

      if (turn === "right") {
        const remainingWidth = totalWidth - currentScroll - containerWidth;
        const scrollAmount = Math.min(containerWidth * 0.8, remainingWidth);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      } else {
        const scrollAmount = Math.min(containerWidth * 0.8, currentScroll);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  };

  // handle link

  const handleLink = (product: ProductData) => {
    setSelectedProduct(product);
    router.push(
      `/store-products/product-actions?productID=${product._id}&productName=${product.name}`
    );
  };

  return (
    <div className="mt-4 w-full h-[94%] bg-white border border-black/15 rounded-2xl overflow-hidden hidden md:block">
      <div className="flex items-center justify-between border-b border-black/15 px-4 py-4">
        <div className="px-2 w-[50%] py-2 bg-black/10 rounded-xl border-black/15 border flex gap-1 items-center">
          <Image src="/icons/search.svg" width={16} height={16} alt="search" />
          <input
            value={storeProductFilters.search ?? ""}
            onChange={(e) =>
              setStoreProductFilters({
                ...storeProductFilters,
                search: e.target.value,
              })
            }
            placeholder="Search for products"
            className="w-full h-full focus:outline-none px-2"
          />
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-2 border border-black/10 pl-3 pr-1 py-[2px] rounded-lg">
            <p className="font-avenir font-[500] text-sm">Category: </p>
            <div className="relative flex items-center">
              <select
                value={storeProductFilters.category}
                onChange={(e) =>
                  setStoreProductFilters({
                    ...storeProductFilters,
                    category: e.target.value,
                  })
                }
                className="appearance-none text-gray-600 focus:outline-none px-2 py-[0.8px] rounded-md font-avenir font-[500] text-sm bg-gray-200 border border-gray-500/10 pr-7"
              >
                <option value="Clothing">All</option>
                {categoriesSelect.map((cat, index) => (
                  <option key={index}>{cat}</option>
                ))}
              </select>
              <Image
                src="/icons/arrow.svg"
                width={10}
                height={10}
                alt="arrow"
                className="absolute right-2 opacity-70"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border border-black/10 pl-3 pr-1 py-[2px] rounded-lg">
            <p className="font-avenir font-[500] text-sm">Status: </p>
            <div className="relative flex items-center">
              <select
                value={storeProductFilters.status}
                onChange={(e) =>
                  setStoreProductFilters({
                    ...storeProductFilters,
                    status: e.target.value as
                      | "active"
                      | "inactive"
                      | "all"
                      | "out-of-stock"
                      | "draft",
                  })
                }
                className={cn(
                  "appearance-none focus:outline-none px-2 py-[0.8px] rounded-md font-avenir font-[500] text-sm border-[0.5px] pr-7 border-black/20",
                  {
                    "bg-green-50 border-green-500 text-green-600":
                      storeProductFilters.status === "active",
                    "bg-gray-200 border-gray-500 text-gray-600":
                      storeProductFilters.status === "inactive",
                    "bg-red-50  border-red-500 text-red-600":
                      storeProductFilters.status === "out-of-stock",
                    "bg-yellow-50 border-yellow-500 text-yellow-600":
                      storeProductFilters.status === "draft",
                  }
                )}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <Image
                src="/icons/arrow.svg"
                width={10}
                height={10}
                alt="arrow"
                className="absolute right-2 opacity-70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="flex flex-col h-[77%] flex-none relative">
        {/* Scroll buttons */}
        <div className="absolute px-6 py-3 flex justify-between items-center w-full z-10 2xl:hidden pointer-events-none">
          <div
            onClick={() => scrollTable("left")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-left"
              className="rotate-180"
            />
          </div>
          <div
            onClick={() => scrollTable("right")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-right"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="w-full min-h-30 2xl:min-h-10 pb-6 xl:py-4 bg-[#f2f2f2] border-b border-black/10 flex flex-col justify-end">
          <div className="w-full h-[1px] bg-black/30 my-4 2xl:hidden" />
          <div
            ref={headerScrollRef}
            onScroll={handleHeaderScroll}
            className="overflow-x-auto scrollbar-hide px-4 scroll-table" >
            {/* Header content with minimum width */}
            <div className="flex min-w-fit">
              <div className="w-[70px] flex gap-2 cursor-pointer flex-shrink-0">
                <Checkbox action={() => {}} active={false} />
              </div>
              <div className="w-[400px] flex gap-2 items-center cursor-pointer flex-shrink-0">
                <p className="font-avenir font-[500] text-md">Product</p>
                <div className="flex flex-col gap-[2px]">
                  <Image
                    src="icons/arrow.svg"
                    width={10}
                    height={10}
                    alt="arrow-up"
                    className="rotate-180 opacity-30"
                  />
                  <Image
                    src="icons/arrow.svg"
                    width={10}
                    height={10}
                    alt="arrow-down"
                    className="opacity-30"
                  />
                </div>
              </div>
              <div className="w-[150px] flex items-center flex-shrink-0">
                <p className="font-avenir font-[500] text-md">Status</p>
              </div>
              <div className="w-[100px] flex items-center flex-shrink-0">
                <p className="font-avenir font-[500] text-md">Price</p>
              </div>
              <div className="w-[150px] flex items-center flex-shrink-0">
                <p className="font-avenir font-[500] text-md">Category</p>
              </div>
              <div className="w-[180px] flex items-center flex-shrink-0">
                <p className="font-avenir font-[500] text-md">Inventory</p>
              </div>
              <div className="w-[240px] flex items-center flex-shrink-0">
                <p className="font-avenir font-[500] text-md">
                  Colors in Stock
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div
          ref={contentScrollRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide"
        >
          <div className="min-w-fit">
            {dashboardProductLoading.products || pagination.isPagLoading ? (
              <>
                <div className="w-full h-[300px] flex items-center justify-center gap-2">
                  <Image
                    src="/icons/loader.svg"
                    width={28}
                    height={28}
                    alt="loading"
                  />
                  <p className="font-avenir pt-[3px] text-lg text-black/50 ">
                    Loading products
                  </p>
                </div>
              </>
            ) : (
              <>
                {dashboardProductErrors.products ? (
                  <>
                    <div className="w-full h-[300px] flex items-center justify-center gap-2  flex-col">
                      {/* <Image
                    src="/icons/loader.svg"
                    width={28}
                    height={28}
                    alt="loading"
                  /> */}
                      <p className="font-avenir pt-[3px] text-lg  text-red-500 ">
                        Something went wrong
                      </p>
                      <p
                        onClick={() => loadStoreProducts()}
                        className="px-10 py-2 cursor-pointer bg-black text-center text-lg mt-4 font-avenir text-white"
                      >
                        Refresh to load Products
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {currentPageProducts?.map((product) => (
                      <div
                        onClick={() => handleLink(product)}
                        key={product._id}
                        className="py-6 px-4 cursor-pointer flex items-center border-b border-black/15"
                      >
                        <div className="w-[70px] flex-shrink-0 gap-2">
                          <Checkbox action={() => {}} active={false} />
                        </div>
                        <div className="w-[400px] flex-shrink-0 flex gap-2 items-center">
                          <div className="flex items-center relative">
                            {product?.variants
                              ?.slice(0, 3)
                              .map((variant, index) => (
                                <div
                                  key={variant._id}
                                  className={`size-10 border border-black/15 rounded-md  absolute  bg-white overflow-hidden ${
                                    index === 0 && "z-30"
                                  } `}
                                  style={{
                                    left: `${index * 10}px`,
                                    rotate: `-${index + 10}deg`,
                                  }}>
                                  {variant.images?.[0]?.url && (
                                    <Image
                                      src={variant.images[0].url}
                                      fill
                                      className="object-cover"
                                      alt={product.name}
                                    />
                                  )}
                                </div>
                              ))}
                          </div>
                          <p className="pl-20 font-avenir font-[500] text-md">
                            {product.name}
                          </p>
                        </div>
                        <div className="w-[150px] flex-shrink-0 flex items-center">
                          <p
                            className={cn(
                              "font-avenir font-[500] text-md rounded-lg px-4 py-[0.5px]",
                              {
                                "bg-green-50 border text-green-500":
                                  product.status === "active",
                                "bg-gray-50 border border-gray-300 text-gray-500":
                                  product.status === "inactive",
                                "bg-yellow-50 border border-yellow-300 text-yellow-500":
                                  product.status === "draft",
                                "bg-red-50 border border-red-300 text-red-500":
                                  product.status === "out-of-stock",
                              }
                            )}
                          >
                            {product.status}
                          </p>
                        </div>
                        <div className="w-[100px] flex-shrink-0 flex items-center">
                          <p className="font-avenir font-[500] text-md">
                            {product.price}
                          </p>
                        </div>
                        <div className="w-[150px] flex-shrink-0 flex items-center">
                          <p className="font-avenir font-[500] text-md">
                            {getCategoryNameById(product.category)}
                          </p>
                        </div>
                        <div className="w-[180px] flex-shrink-0 flex items-center">
                          <p className="font-avenir font-[500] text-md">
                            {product.totalNumber} in stocks
                          </p>
                        </div>
                        <div className="w-[240px] flex-shrink-0 flex items-center gap-1">
                          {product?.variants?.map((variant, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <p>{variant.stock}</p>
                              <div
                                style={{ backgroundColor: variant.colorHex }}
                                className="size-4 border border-black/15 rounded-sm "
                              ></div>
                              ,
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Pagination />
    </div>
  );
};

const MobileTabs = () => {
  const tabs = [
    {
      name: "All",
      icon: "product.svg",
      num: 3,
    },
    {
      name: "Active",
      icon: "product-ac.svg",
      num: 5,
    },
    {
      name: "Inactive",
      icon: "product-inac.svg",
      num: 2,
    },
    {
      name: "Out-of-Stocks",
      icon: "product-out.svg",
      num: 0,
    },
  ];

  return (
    <div className="mt-8 max-sm:px-3 md:hidden">
      <p className="font-avenir text-lg md:text-2xl ">Tables</p>
      <div className="mt-2 flex flex-col gap-2">
        {tabs.map((tab, index) => (
          <Link
            href={`/store-products/mobile-table/${tab.name.toLowerCase()}`}>
            <div className="w-full bg-white border border-black/20 py-2 px-3 rounded-xl flex items-center justify-between">
              <div className="flex  gap-1">
                <Image
                  src={`/icons/${tab.icon}`}
                  width={16}
                  height={16}
                  alt="products"
                />
                <p className="text-sm font-avenir mt-[3px] ">{tab.name}</p>
              </div>
              <div className="flex  gap-1">
                <div className="size-5 rounded-full border border-red-500 flex items-center justify-center">
                  <p className="text-xs font-avenir">{tab.num}</p>
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="rotate-[-90deg]"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
