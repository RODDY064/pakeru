"use client";

import Button from "@/app/ui/button";
import CartCard from "@/app/ui/cartCard";
import Icon from "@/app/ui/Icon";
import { cn } from "@/libs/cn";
import { handleNavigation } from "@/libs/navigate";
import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function YourCart() {
  const { isMobile, cartItems, setRouteChange, getCartStats } = useBoundStore();
  const totalRef = useRef<HTMLDivElement>(null);
  const cartDiv = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const router = useRouter()
  const [cartStat,setCartStat] = useState({
    totalPrice:0,
    totalItems:0
  })

  const handleLink = (e:any)=>{
     handleNavigation(e, "/product", router, setRouteChange, 200)
  }

  const handlePayment = (e:any)=>{
     handleNavigation(e, "/payment", router, setRouteChange, 200)
  }

  useGSAP(() => {
    if (isMobile) return;

    if (!totalRef.current || !cartDiv.current) return;

    const sticky = totalRef.current;
    const image = cartDiv.current;

    gsap.to(image, {
      scrollTrigger: {
        trigger: sticky,
        start: "top 10%",
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      },
    });
  });

  useEffect(()=>{
   const { totalItems, totalPrice} = getCartStats()

   setCartStat({
    totalItems,
    totalPrice
   })

  },[getCartStats,cartItems])

  return (
    <div className="w-full min-h-screen flex flex-col items-center text-black ">
      <div className="w-full h-full flex-col md:flex-row  bg-white flex overflow-hidden gap-4 pt-30">
        <div
          ref={cartDiv}
          className="md:w-[65%] lg:w-[70%] md:min-h-[100vh] bg-[#f2f2f2] flex flex-col items-center flex-none cartDiv max-sm:px-3"
        >
          <div className="w-[95%] lg:w-[85%] xl:w-[75%] h-full py-12">
            <div className="flex justify-between max-sm:px-1">
              <div className="relative">
                <p className="font-avenir font-[400] text-md">
                  MY SHOPPING CART
                </p>
                <div className="absolute size-5 border top-[-1.2rem]  right-[-1.2rem] items-center justify-center flex rounded-full">
                  <p className="font-avenir font-[400] text-sm text-red-500">
                    {cartItems.length}
                  </p>
                </div>
              </div>
              <p onClick={handleLink} className="hidden md:flex md:text-sm font-[300] underline underline-offset-3 cursor-pointer">
                CONTINUE SHOPPING
              </p>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div className="mt-4">
                  {cartItems?.map((cart) => (
                    <CartCard key={cart._id + cart.selectedColor} cartData={cart} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full flex items-center flex-col pt-12 lg:pt-24 xl:pt-32">
                  <Image
                    src="/icons/cart.svg"
                    width={300}
                    height={64}
                    alt="cart"
                    className="hidden md:flex"
                  />
                  <Image
                    src="/icons/cart.svg"
                    width={200}
                    height={64}
                    alt="cart"
                    className="md:hidden"
                  />
                  <p className="text-gray-400 font-avenir font-[400] text-sm">
                    YOUR CART IS EMPTY.
                  </p>
                  <div className="my-10">
                    <Button action={handleLink} word="GO TO SHOP" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          ref={totalRef}
          className="md:w-[35%] lg:w-[30%] pt-12 px-6 md:px-3 lg:px-10 w-full flex flex-col items-center totalDiv"
        >
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <p className="font-avenir font-[400] text-md">SUBTOTAL</p>
              <p className="font-avenir font-[400] text-md">GHS {cartStat.totalPrice.toFixed(2)}</p>
            </div>
            <div className="w-full flex items-center justify-between mt-1 text-black/50">
              <p className="font-avenir font-[400] text-md">DISCOUNT</p>
              <p className="font-avenir font-[400] text-md">GHS 0.00</p>
            </div>
            <p className="text-sm md:text-sm font-avenir font-[300] md:font-[400] my-2 text-black/50">
              Shipping will be calculated base on your address.
            </p>
            <div className="w-full flex items-center justify-between my-6">
              <p className="font-avenir font-[400] text-md">TOTAL</p>
              <p className="font-avenir font-[400] text-md">GHS {cartStat.totalPrice.toFixed(2)}</p>
            </div>
            <Link href="/payment">
            <div  className="mt-4 rounded py-2.5 flex items-center justify-center gap-3 w-full  bg-black   border border-black/20  group/add cursor-pointer transition-all">
              <p className="font-avenir font-[400] text-sm pt-[4px] text-white ">
                PROCEED TO CHECHOUT
              </p>
            </div></Link>
            <div className="px-3 py-4 rounded-md bg-gray-100 my-4">
              <p className="text-sm font-avenir text-black/60 font-[400]">
                By selecting any Express Payment option, you confirm that you
                have read, understood and accepted our{" "}
                <span className="underline underline-offset-4 cursor-pointer">
                  Terms and Conditions
                </span>
              </p>
            </div>
            <div className="w-full my-10 ">
              <div className="flex items-start gap-3 py-4 border-y border-black/10">
                <Image
                  src="/icons/payment.svg"
                  width={24}
                  height={24}
                  alt="payment"
                />
                <div className="">
                  <p className="font-avenir font-[400] text-md ">Payment</p>
                  <p className="font-avenir text-sm text-black/50 my-1 ">
                    Mobile money or Credit credit
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-4 border-b border-black/10">
                <Image
                  src="/icons/shipping.svg"
                  width={24}
                  height={24}
                  alt="payment"
                />
                <div className="">
                  <p className="font-avenir font-[400] text-md ">
                    Shipping & Delivery
                  </p>
                  <p className="font-avenir text-sm text-black/50 my-1 ">
                    Mobile money or Credit credit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
