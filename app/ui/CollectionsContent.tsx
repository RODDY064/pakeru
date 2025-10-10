"use client";

import Image from "next/image";
import React, { useEffect, useState, useCallback, use } from "react";
import ProductCard from "./product-card";
import { useSearchParams } from "next/navigation";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import { GalleryItem } from "@/store/dashbaord/content-store/content";
import Cedis from "./cedis";
import Link from "next/link";

// Utility to debounce functions
interface DebounceFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
}

interface Debounce {
  <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): DebounceFunction<T>;
}

const debounce: Debounce = (func, wait) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function CollectionsContent({ id }: { id: string }) {
  const [containerHeight, setContainerHeight] = useState("100vh");
  const [productsLink, setProductsLink] = useState<ProductData[]>([]);
  const [activeGallery, setActiveGallery] = useState<GalleryItem>();
  const { galleries, products, loadProducts } = useBoundStore();
  const [isDesktop, setIsDesktop] = useState(false);
  const [productLinkIds, setProductLinkIds] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
  const run = async () => {
    const galleryFind = galleries?.find((item) => item._id === id);
    if (galleryFind) {
      setActiveGallery(galleryFind);
      setProductLinkIds(galleryFind.products);

      setIsLoadingProducts(true);
      
      // Load gallery-specific products if they exist, otherwise load all products
      if (galleryFind.products && galleryFind.products.length > 0) {
        await loadProducts(true, 1, 25, {
          products: galleryFind.products,
        });
      } else {
        await loadProducts(true, 1, 25);
      }
      
      setIsLoadingProducts(false);
    }
  };
  run();
}, [id, galleries]);

useEffect(() => {
  if (!isLoadingProducts) {
    // Filter products that match the gallery's product IDs
    if (productLinkIds && productLinkIds.length > 0) {
      const filtered = products.filter(p => productLinkIds.includes(p._id));
      setProductsLink(filtered);
    } else {
      setProductsLink(products);
    }
  }
}, [products, productLinkIds, isLoadingProducts]);


  // Calculate container height
  const calculateHeight = useCallback(
    debounce(() => {
      const actualVH = window.innerHeight;
      setContainerHeight(`${actualVH}px`);
      document.documentElement.style.setProperty(
        "--actual-vh",
        `${actualVH * 0.01}px`
      );
    }, 100),
    []
  );

  // Update card type based on viewport width

  return (
    <>
      <div className="w-full pt-32  px-4  xl:px-8 relative ">
        <div className="w-full h-full flex lg:flex-row   flex-col ">
          <div className="w-full flex-shrink-0 h-svh lg:w-[50%] relative  ">
            <div className=" w-full relative h-full ">
              <Image
                src={activeGallery?.image.url ?? "/images/image-fallback.png"}
                fill
                sizes="100vw"
                alt="collection"
                className="object-cover"
                priority
              />
              <h1 className="text-black font-avenir uppercase text-xl font-semibold tracking-wide absolute top-0">
                {activeGallery?.name}
              </h1>
            </div>
          </div>
          <div className="w-full  mt-6 md:mt-0 hidden lg:block lg:w-[50%] flex-shrink-0 ">
            <div className="w-full grid grid-cols-2">
              {isLoadingProducts ? (
                <div className="w-full min-h-[400px] col-span-2 flex flex-col items-center justify-center">
                  <Image
                    src="/icons/loader.svg"
                    width={36}
                    height={36}
                    alt="loading icon"
                  />
                </div>
              ) : (
                <>
                  {productsLink?.slice(0, 4).map((item) => (
                    <CollectionCard key={item._id} data={item} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isLoadingProducts && (
        <>
          {((isDesktop && productsLink.length > 4) ||
            (!isDesktop && productsLink.length > 0)) && (
            <div className="mt-12 px-4 xl:px-8 w-full flex flex-col items-center text-black home-main transition-all">
              <p className="w-full font-avenir text-lg">Products</p>
              <div className="w-full grid px-8 md:px-0 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-6 transition-all duration-500 ease-in-out mt-10">
                {(isDesktop ? productsLink.slice(4) : productsLink).map(
                  (item) => (
                    <ProductCard
                      key={item._id}
                      type="large"
                      productData={item}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

const CollectionCard = ({ data }: { data: ProductData }) => {
  return (
    <Link href={`/shop/${data._id}`}>
      <div className="w-full  lg:h-[250px] xl:h-[320px] 2xl:h-[450px] ">
        <div className="w-full h-full relative lex border border-black/10 rounded-sm cursor-pointer transition-shadow duration-300 hover:border hover:z-20 hover:border-black/20">
          <Image
            src={data.mainImage.url ?? "/images/image-fallback.png"}
            fill
            sizes="100vw"
            alt="collection"
            className="object-cover"
            priority
          />
          <p className="w-[60%] font-avenir font-normal text-black/70 pt-[4px] absolute bottom-2 left-2">
            {data.name}
          </p>
        </div>
      </div>
    </Link>
  );
};
