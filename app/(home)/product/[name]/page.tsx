
import ProductContainer from "@/app/ui/productContainer";
import Image from "next/image";
import React, { Suspense } from "react";


export default async function SingleProduct({ params }:{ params: Promise<{ name: string }>}) {
  
   const { name } = await params

  return <>
  <Suspense fallback={<div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center">
        <Image src="/icons/loader.svg" width={34} height={34} alt="loader"/>
      </div>}>
    <ProductContainer nameID={name}/>
  </Suspense>
  </>
}
