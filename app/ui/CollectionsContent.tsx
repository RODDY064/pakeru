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
  const [cardType, setCardType] = useState<"small" | "medium">("small");
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

        // Set loading state
        setIsLoadingProducts(true);
        await loadProducts(true, 1, 25, {
          products: galleryFind.products,
        });
        setIsLoadingProducts(false);
      }
    };
    run();
  }, [id, galleries]);

  useEffect(() => {
    if (productLinkIds && !isLoadingProducts) {
      setProductsLink(products);
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
  const updateCardType = useCallback(
    debounce(() => {
      setCardType(window.innerWidth >= 1024 ? "medium" : "small");
    }, 100),
    []
  );

  useEffect(() => {
    calculateHeight();
    updateCardType();
    window.addEventListener("resize", calculateHeight);
    window.addEventListener("orientationchange", calculateHeight);
    window.addEventListener("resize", updateCardType);

    return () => {
      window.removeEventListener("resize", calculateHeight);
      window.removeEventListener("orientationchange", calculateHeight);
      window.removeEventListener("resize", updateCardType);
    };
  }, [calculateHeight, updateCardType]);

  return (
    <>
      <div className="w-full pt-36  px-4  xl:px-8 relative ">
        <div className="w-full h-full flex lg:flex-row   flex-col ">
          <div className="w-full flex-shrink-0 h-full lg:w-[55%] relative">
            <h1 className="text-black font-avenir uppercase text-xl font-semibold tracking-wide">
              {activeGallery?.name}
            </h1>
            <p className="w-full sm:w-[70%] mt-4 font-avenir text-black/50 font-[500] text-md text-balance"></p>
            <div
              style={{ height: containerHeight }}
              className="mt-4 w-full relative h-full bg-amber-100"
            >
              <Image
                src={activeGallery?.image.url ?? "/images/image-fallback.png"}
                fill
                sizes="100vw"
                alt="collection"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="w-full  mt-6 md:mt-0 hidden lg:block lg:w-[45%] flex-shrink-0 ">
            <div className="w-full flex justify-end">
              <div className="w-full flex flex-wrap items-start gap-4">
                {isLoadingProducts ? (
                  <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
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
      </div>
      {isLoadingProducts ? (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
          <Image
            src="/icons/loader.svg"
            width={36}
            height={36}
            alt="loading icon"
          />
        </div>
      ) : (
        <>
          {isDesktop
            ? productsLink.length > 5
            : productsLink.length > 0 && (
                <div className="mt-12 px-4 xl:px-8 w-full  flex flex-col items-center text-black  home-main  transition-all">
                  <p className="w-full font-avenir text-lg">Products</p>
                  <div className="w-full flex flex-wrap  gap-6 mt-10">
                    {(isDesktop ? productsLink.slice(4) : productsLink).map(
                      (item) => (
                        <ProductCard
                          key={item._id}
                          type="medium"
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

const CollectionCard = ({ data }: { data: ProductData  }) => {
  return (
    <Link href={`/shop/${data._id}`}>
    <div className="lg:w-[200px] xl:w-[300px]  lg:h-[250px] xl:h-[320px] 2xl:h-[350px] ">
      <div className="w-full h-[90%] relative lex border border-black/10 rounded-sm cursor-pointer transition-shadow duration-300 hover:border hover:z-20 hover:border-black/20">
        <Image
          src={data.mainImage.url ?? "/images/image-fallback.png"}
          fill
          sizes="100vw"
          alt="collection"
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full h-[10%] pt-3 px-[2px]">
        <div className="flex items-start justify-between">
          <div className="w-[60%] font-avenir font-normal text-black/70 pt-[4px]">
            {data.name}
          </div>

          <div className="w-[30%] flex items-center justify-end text-black/50 gap-0.5 ">
            <Cedis cedisStyle="opacity-40 pt-[4px]"/>
            <p className="font-avenir font-normal text-black/50 pt-[7px]">{data.price}</p>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
};
