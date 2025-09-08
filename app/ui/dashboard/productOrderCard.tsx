import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ProductOrderCardProps {
  productID: string;
  colorID: string;
  size: string;
  quantity: number;
}

export default function ProductOrderCard({
  productID,
  colorID,
  size,
  quantity,
}: ProductOrderCardProps) {

  const { product, loading, error } = useOrderProduct(
    productID,
    colorID,
    size,
    quantity
  );

  return (
    <div className="w-full h-[450px] bg-black/5 rounded-[20px] flex gap-2 flex-col border border-dashed  border-black/60 p-2">
      <div className="w-full h-[85%]  border border-black/30 rounded-2xl relative overflow-hidden">
        <Image
          src="/images/hero-2.png"
          fill
          alt="hero"
          className="object-cover"
        />
      </div>
      <div className="w-full py-1 px-1 ">
        <p className="font-avenir text-sm uppercase">{product?.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-avenir text-sm text-black/50">
            GHS {product?.price}
          </p>
          <p className="font-avenir text-xs text-green-500 bg-green-50 border-[0.5px] border-green-500 px-2 rounded-full">
            available
          </p>
        </div>
      </div>
      <div className="w-full h-[40px] flex gap-2 ">
        <div className="w-full h-full border border-black/30 rounded-[10px] flex items-center justify-center bg-white">
          XL
        </div>
        <div className="w-full h-full border border-black/30 rounded-[10px] flex gap-2 items-center justify-center bg-white">
          <div className="size-4 border bg-black border-black rounded-full"></div>
          <p className="font-avenir text-sm text-black pt-[1.5px]">BLACK</p>
        </div>
      </div>
      <div className="w-full h-[40px] flex-shrink-0  border border-black/30 flex items-center justify-center rounded-[10px] bg-white">
        <p className="font-avenir text-sm text-black pt-[1.5px]">
          <span className="text-black/50">QUANTITY:</span> 2
        </p>
      </div>
    </div>
  );
}

const useOrderProduct = (
  productID: string,
  colorID: string,
  size: string,
  quantity: number
) => {
  const { getOrderProduct, loadStoreProducts } = useBoundStore();
  const [product, setProduct] =  useState<ProductData | undefined | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isCancelled) {
          const productData = await getOrderProduct(
            productID,
            colorID,
            size,
            quantity
          );
          setProduct(productData);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Failed to fetch product");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isCancelled = true;
    };
  }, [productID, colorID, size, getOrderProduct, loadStoreProducts]);

  return { product, loading, error };
};
