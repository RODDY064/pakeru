
import ProductContainer from "@/app/ui/productContainer";
import React, { Suspense } from "react";


export default async function SingleProduct({ params }:{ params: Promise<{ name: string }>}) {
  
   const { name } = await params

  return <>
  <Suspense>
    <ProductContainer nameID={name}/>
  </Suspense>
  </>
}
