"use client";

import { handleNavigation } from "@/libs/navigate";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/input";
import { CartItemType } from "@/store/cart";

export default function Payment() {
  const { setRouteChange, cartItems,getCartStats } = useBoundStore();
  const router = useRouter();
  const { register } = useForm();
   const [cartStat,setCartStat] = useState({
      totalPrice:0,
      totalItems:0
    })


      useEffect(()=>{
       const { totalItems, totalPrice} = getCartStats()
    
       setCartStat({
        totalItems,
        totalPrice
       })
    
      },[getCartStats,cartItems])
    
    

  return (
    <div className="w-full min-h-dvh flex flex-col items-center bg-[#f2f2f2] pb-20">
      <div className="w-full flex flex-row justify-between px-3 md:px-8 items-center bg-white border-b border-black/20">
        <Link
          href="/"
          onClick={(e) => handleNavigation(e, "/", router, setRouteChange, 200)}
          className="flex-none w-24 h-[24px] " >
          <Image
            src="/icons/text-logo.svg"
            width={150}
            height={12}
            alt="logo"
            className="mt-[-2.4rem] "
          />
        </Link>
        <div className="w-fit h-full  border-l border-black/20 py-5 text-center pl-6 flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 flex-none">
            <Image src="/icons/call.svg" width={20} height={20} alt="call" />
            <p className="font-avenir font-[400] text-black/60 text-md mt-1">
              Call us at <span className="pl-1">0599969735</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex mt-12 h-fit w-[95%] md:w-[94%] lg:w-[80%]  flex-col md:flex-row items-start justify-center  gap-4  ">
        <div className="flex w-full   md:w-[60%]  lg:w-[45%] flex-none flex-col  ">
          <div
          onClick={()=> router.back()}
           className="flex gap-2 items-center cursor-pointer">
            <Image
              src="/icons/arrow.svg"
              width={16}
              height={16}
              alt="call"
              className="rotate-90"
            />
            <p className="font-avenir text-md font-[400] mt-[4px]">Back</p>
          </div>
          <div className="w-full  bg-white mt-3.5 rounded-md px-6 py-6 pb-8">
            <div className="flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">IDENTIFICATION</p>
            
            </div>
            <div className="mt-6 ">
              <Input
                type="email"
                textStyle="md:text-md"
                placeH="Enter your email"
                label="Email"
                name="email"
                image="/icons/email.svg"
                register={register}
              />
              <div className="w-full flex items-center justify-between mt-4 gap-2">
                <div className="w-1/2">
                  <Input
                    type="text"
                    textStyle="md:text-md"
                    placeH="Jane"
                    label="Firstname"
                    name="email"
                    image="/icons/user.svg"
                    register={register}
                  />
                </div>
                <div className="w-1/2">
                  <Input
                    type="text"
                    textStyle="md:text-md"
                    placeH="Doe"
                    label="Lastname"
                    name="email"
                    image="/icons/user.svg"
                    register={register}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Ashanti"
                  label="Region"
                  name="region"
                  imageW={24}
                  image="/icons/world.svg"
                  register={register}
                />
              </div>
            </div>
          </div>
           <div className="w-full  bg-white mt-3.5 rounded-md px-6 py-6 pb-8">
            <div className="flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">SHIPPING ADDRESS</p>
             
            </div>
            <div className="mt-6">
             <div>
               <Input
                type="email"
                textStyle="md:text-md"
                placeH="14 Avenue St. Street"
                label="Address"
                name="email"
                image="/icons/address.svg"
                register={register}
              />
              <p className="my-2 text-sm font-avenir text-black/50">Detailed street address can help our rider find you quickly.</p>
             </div>
             <div className="mt-2">
              <Input
                type="email"
                textStyle="md:text-md"
                placeH="Santasi, Kumasi"
                label="Town"
                name="town"
                image="/icons/town.svg"
                imageW={26}
                register={register}
              />
             </div>
            
              <div className="mt-4">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Near Boukrom Church Of Pentocost"
                  label="Landmark"
                  name="landmark
                  "
                  image="/icons/landmark.svg"
                  register={register}
                />
              </div>
            </div>
          </div>
          <input type="button" value="Submit" className="bg-black text-white py-4 font-avenir font-[500] text-lg cursor-pointer mt-6 rounded-md"/>
        </div>

        <div className="flex h-fit w-full md:w-[40%] lg:w-[35%]  flex-col gap-4 flex-none pt-10  ">
          <div className="w-full  bg-white rounded-md px-4 py-6">
            <div className="flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">MY SHOPPING CART</p>
            </div>
            <div className="mt-4 flex flex-col">
              {cartItems?.map((cart) => (
                <PaymentCard key={cart.id}  cart={cart}/>
              ))}
            </div>
            <div className="mt-10">
              <div className="w-full flex items-center justify-between">
                <p className="font-avenir font-[400] text-sm">TOTAL</p>
                <p className="font-avenir font-[400] text-sm">GHS {cartStat?.totalPrice.toFixed(2)}</p>
              </div>
              {/* <div className="w-full flex items-center justify-between mt-1 text-black/50">
                <p className="font-avenir font-[400] text-sm">SHIPPING</p>
                <p className="font-avenir font-[400] text-sm">GHS 0.00</p>
              </div> */}
            </div>
          </div>
          <div className="w-full h-full bg-white rounded-md px-4 py-6 ">
            <div className="flex items-start gap-3 py-4 border-b border-black/10">
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
            <div className="flex items-start gap-3 py-4">
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
  );
}

const PaymentCard = ({ cart}:{ cart:CartItemType}) => {
  return (
    <div className="py-4 border-b border-black/10 flex items-end gap-3">
      <div className="w-[30%] md:w-[20%] h-20 lg:h-20 rounded relative overflow-hidden">
        <Image
          src={cart?.mainImage as string}
          fill
          className="object-cover"
          alt={cart?.name}
        />
      </div>
      <div>
        <p className="font-avenir font-[400] text-sm uppercase">{cart?.name}</p>
        <p className="font-avenir  font-[400]  text-sm text-black/50  ">
          GHS {cart?.price}
        </p>
        <p className="font-avenir  font-[400]  text-xs text-black/50   mt-2">
          QUANTITY: {cart?.quantity}
        </p>
      </div>
    </div>
  );
};
