import { Suspense } from "react";
import ProductActions from "./action";
import Image from "next/image";


export default function ProductActionsPage() {

  const Loader = ()=> {
    return (<div className="w-full h-"></div>)
  }


  return (
    <Suspense fallback={<div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center">
      <Image src="/icons/loader.svg" width={34} height={34} alt="loader"/>
    </div>}>
      <ProductActions/>
    </Suspense>
  );
}

