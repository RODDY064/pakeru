"use client";
import Checkbox from "@/app/ui/dashboard/checkbox";
import Pagination from "@/app/ui/dashboard/pagination";
import StatCard from "@/app/ui/dashboard/statsCard";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import Table, { Column } from "@/app/ui/dashboard/table";
import { cn } from "@/libs/cn";
import { useApiClient } from "@/libs/useApiClient";
import { Filters, ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Products() {
  const {
    getProductStats,
    storeProductFilters,
    setStoreProductFilters,
    filteredStoreProducts,
    storeProducts,
    loadStoreProducts,
    dashboardProductLoading,
    dashboardProductErrors,
    slice,
    configure,
    updateFromAPI,
    pagination,
    categories,
    loadCategories,
    setSelectedProduct,
    getCategoryNameById,
  } = useBoundStore();

  const { get } = useApiClient();
  const [currentPageProducts, setCurrentPageProducts] = useState<ProductData[]>(
    []
  );
  const [categoriesSelect, setCategoriesSelect] = useState<string[]>([]);
  const router = useRouter();
  const [productState, setProductState] = useState<
    "idle" | "loading" | "success" | "failed"
  >("idle");
  const [isFilterd, setIsFilterd] = useState(false);

  useEffect(() => {
    if (dashboardProductLoading.products || pagination.isLoading) {
      setProductState("loading");
    } else if (dashboardProductErrors.products) {
      setProductState("failed");
    } else {
      setProductState("success");
    }
  }, [
    dashboardProductLoading.products,
    pagination.isLoading,
    dashboardProductErrors.products,
  ]);

  useEffect(() => {
    loadStoreProducts(true, get);
    loadCategories();
  }, []);

  useEffect(() => {
    if (filteredStoreProducts.length === 0) {
      setIsFilterd(true);
    }
  }, [filteredStoreProducts]);

  useEffect(() => {
    const catNames = categories.map((cat) => cat.name);
    setCategoriesSelect(catNames);
  }, [categories]);

  useEffect(() => {
    console.log(pagination);
  }, [pagination]);

  const loadProductForPagination = async (page: number) => {
    await loadStoreProducts(false, get);
  };

  useEffect(() => {
    configure({
      dataKey: "storeProducts",
      loadFunction: loadProductForPagination,
      size: 25,
    });
  }, []);

  useEffect(() => {
    updateFromAPI({
      total: storeProducts.length,
      totalPages: storeProducts.length,
      page: 1,
    });
  }, [storeProducts]);

  useEffect(() => {
    const sliceData = slice(filteredStoreProducts);
    setCurrentPageProducts(sliceData);
  }, [pagination, storeProducts, storeProductFilters, filteredStoreProducts]);

  const [stats, setStats] = useState([
    { label: "Total Products", value: 0 },
    { label: "Active Products", value: 0 },
    { label: "Inactive Products", value: 0 },
    { label: "Product Out of Stock", value: 0 },
  ]);

  useEffect(() => {
    const productStats = getProductStats();

    setStats([
      { label: "Total Products", value: productStats.total ?? 0 },
      { label: "Active Products", value: productStats.active ?? 0 },
      { label: "Inactive Products", value: productStats.inactive ?? 0 },
      { label: "Product Out of Stock", value: productStats.outOfStock ?? 0 },
    ]);
  }, [storeProducts,currentPageProducts, filteredStoreProducts]);

  // filtering

  const tableColumns: Column[] = [
    {
      label: (
        <div className="w-[20px] flex gap-2 cursor-pointer flex-shrink-0"></div>
      ),
      width: "w-[20px]",
      render: (product: any) => (
        <div className="w-[20px] flex gap-2 cursor-pointer flex-shrink-0"></div>
      ),
    },
    {
      label: (
        <div className="w-[400px] flex gap-2 items-center cursor-pointer flex-shrink-0">
          <p className="font-avenir font-[500] text-md">Product</p>
          <div className="flex flex-col gap-[2px]">
            <Image
              src="/icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-up"
              className="rotate-180 opacity-30"
            />
            <Image
              src="/icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-down"
              className="opacity-30"
            />
          </div>
        </div>
      ),
      width: "w-[400px]",
      style: "flex-shrink-0 flex gap-2 items-cente",
      render: (product: ProductData) => (
        <div className="flex items-center relative  h-12 ">
          {product?.variants?.slice(0, 3).map((variant, index) => (
            <div
              key={variant._id}
              className={`size-10 border p absolute border-black/15 rounded-md   bg-white overflow-hidden ${
                index === 0 && "z-30"
              } `}
              style={{
                left: `${index * 10}px`,
                rotate: `-${index + 10}deg`,
              }}
            >
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
          <p className="pl-20 font-avenir font-[500] text-black text-md">
            {product.name}
          </p>
        </div>
      ),
    },
    {
      label: "Status",
      width: "w-[150px]",
      render: (product: ProductData) => (
        <StatusBadge
          status={product.status}
          statuses={["active", "inactive", "out-of-stock", "draft"]}
        />
      ),
    },
    {
      label: "Price",
      width: "w-[100px]",
      render: (product: ProductData) => (
        <p className="font-avenir font-[500] text-md">{product.price}</p>
      ),
    },
    {
      label: "Category",
      width: "w-[150px]",
      render: (product: ProductData) => (
        <p className="font-avenir font-[500] text-md">
          {" "}
          {getCategoryNameById(product.category)}
        </p>
      ),
    },
    {
      label: "Inventory",
      width: "w-[180px]",
      render: (product: ProductData) => (
        <p className="font-avenir font-[500] text-md">
          {product.totalNumber} in Stocks
        </p>
      ),
    },
    {
      label: " Colors in Stock",
      width: "w-[240px]",
      render: (product: ProductData) => (
        <div className="flex items-center gap-2">
          {product?.variants?.map((variant, index) => (
            <div key={index} className="flex items-center gap-1">
              <p>{variant.stock}</p>
              <div
                style={{ backgroundColor: variant.colorHex }}
                className="size-4 border border-black/15 rounded-sm "
              ></div>
              {index !== product.variants.length - 1 && ","}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleLink = (product: ProductData) => {
    setSelectedProduct(product);
    router.push(
      `/admin/store-products/product-actions?productID=${product._id}&productName=${product.name}`
    );
  };

    const handleReload = async () => {
    router.refresh();
    setTimeout(() => {
      loadStoreProducts(true, get);
    }, 150);
  };
  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[16%]  pt-4 pb-26 ">
      <div className="flex items-center justify-between max-sm:px-3">
        <p className="font-avenir text-xl font-bold">Products</p>
        <Link
          href="/admin/store-products/product-actions"
          className="p-1.5 sm:px-3   bg-black flex items-center gap-2 cursor-pointer rounded-xl"
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
      <div className="mt-2 w-full h-fit bg-white border border-black/15 sm:rounded-2xl  flex md:px-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <Table
        header={
          <Header
            setStoreProductFilters={setStoreProductFilters}
            storeProductFilters={storeProductFilters}
            categoriesSelect={categoriesSelect}
          />
        }
        tabelState={productState}
        columns={tableColumns}
        data={currentPageProducts}
        tableName="Products"
        reload={() => handleReload()}
        columnStyle="py-4"
        columnClick={(product) => handleLink(product)}
        dateKey="createdAt"
        isFilterd={isFilterd}
      />
      <MobileTabs />
    </div>
  );
}

const Header = ({
  storeProductFilters,
  setStoreProductFilters,
  categoriesSelect,
}: {
  storeProductFilters: Filters;
  setStoreProductFilters: (filters: Partial<Filters>) => void;
  categoriesSelect: string[];
}) => {
  return (
    <>
      <div className="px-2 w-[50%] py-[6px] bg-black/10 rounded-xl  border-black/15 border flex gap-1 items-center">
        <Image src="/icons/search.svg" width={16} height={16} alt="search" />
        <input
          value={storeProductFilters.search ?? ""}
          onChange={(e) =>
            setStoreProductFilters({
              ...storeProductFilters,
              search: e.target.value,
            })
          }
          placeholder="Search for a product by the name"
          className="w-full h-full focus:outline-none px-2 text-sm"
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
              <option value="all">All</option>
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
    </>
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
            key={index}
            href={`/admin/store-products/mobile-table/${tab.name.toLowerCase()}`}
          >
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
