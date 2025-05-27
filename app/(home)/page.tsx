"use client"

import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Button from "../ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const { scrollAmount }  = useBoundStore()
  const router = useRouter()

  useGSAP(()=>{
    //  console.log(scrollAmount)
     if (scrollAmount >= 100) {
      const tl = gsap.timeline({})

      tl.set('.slider-container',{
    
      })
     }
  },[scrollAmount])
  
const handleAction = ()=>{
  router.push("/product")
}


  return (
    <div className="w-full min-h-screen  flex flex-col items-center bg-black home-main">
      <ImageSlider action={handleAction} />
      <div className="w-full h-[700px] text-white"> </div>
    </div>
  );
}

const ImageSlider = ({ action }:{ action:any}) => {
  return (
    <div className="w-full h-[500px] md:h-[700px] slider-container font-manrop" >
      <div className="slider w-full  h-full">
        <div className="w-full h-full relative ">  
          <Image src="/images/shop.jpg" 
           fill
           className="object-cover" alt="shop"/>
           <div className="absolute w-full h-full flex  flex-col  justify-end   ">
            <div className="w-full h-24 md:h-64 bg-gradient-to-b bg-transparent to-black flex flex-col gap-2 items-center justify-center">
              <h1 className="text-white font-manrop font-bold text-3xl md:text-4xl">IN THE TROPICS</h1>
              <p className="capitalise text-white tex-sm md:text-md text-center px-12 ">EVERY PRODUCT WE CRAFT IS DESIGNED TO FUEL YOUR.</p>
              <Button
              action={action}
              word="SHOP NOW"/>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
