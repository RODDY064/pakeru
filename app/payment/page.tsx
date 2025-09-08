"use client";

import { handleNavigation } from "@/libs/navigate";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../ui/input";
import { CartItemType } from "@/store/cart";
import { z } from "zod";
import router from "next/router";

const userDetailsSchema = z.object({
  useremail: z.string().email("Please enter a valid email address"),
  firstname: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  region: z.string().min(1, "Region is required"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Please provide a detailed address"),
  town: z.string().min(1, "Town is required"),
  landmark: z.string().optional(),
});

type UserDetailsForm = z.infer<typeof userDetailsSchema>;

export default function Payment() {
  const { setRouteChange, cartItems, getCartStats, user } = useBoundStore();
  const [payError, setPayError] = useState<string>("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<UserDetailsForm>({
    resolver: zodResolver(userDetailsSchema),
  });

  const [cartStat, setCartStat] = useState({
    totalPrice: 0,
    totalItems: 0,
  });

  useEffect(() => {
    const { totalItems, totalPrice } = getCartStats();
    setCartStat({
      totalItems,
      totalPrice,
    });
  }, [getCartStats, cartItems]);

  useEffect(() => {
    setValue("firstname", user?.firstname ?? "admin(updated)");
    setValue("useremail", user?.email ?? "admin@gmail.com");
    setValue("lastname", user?.lastname ?? "admin");
  }, [setValue, user]);

  const onSubmit = async (data: UserDetailsForm) => {
    if (cartItems.length === 0) {
      setPayError("Your cart is empty!");
      return;
    }
    console.log("Form submitted:", data);

    const productsArray = cartItems?.map((cart) => ({
      productId: cart.id,
      quantity: cart.quantity,
      variantID: cart.variants?.find((v) => v.id === cart.selectedColor)?.id,
      size: cart.selectedSize,
    }));

    const paymentPayload = {
      shippingAddress: {
        address: data.address,
        town: data.town,
        region: data.region,
        landmark: data.landmark,
      },
      items: {
        numOfItems: cartItems.length,
        products: productsArray,
      },
      totalPrice: cartStat?.totalPrice,
      discountCode:""
    };

    console.log(paymentPayload, "payload");

    try {
      const baseURL = "https://148d845ca813.ngrok-free.app/api/v1";
      const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

      const res = await fetch(`${baseURL}/orders`, {
        method: "POST",
        headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(paymentPayload),
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex mt-8 h-fit w-[95%] md:w-[94%] lg:w-[80%]  flex-col md:flex-row items-start justify-center  gap-4 "
    >
      <div className="flex w-full   md:w-[60%]  lg:w-[45%] flex-none flex-col  ">
        <div
          onClick={() => router.back()}
          className="flex gap-2 items-center cursor-pointer"
        >
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
              name="useremail"
              image="/icons/email.svg"
              register={register}
              error={errors}
              disbale={true}
            />
            <div className="w-full flex items-center justify-between mt-4 gap-2">
              <div className="w-1/2">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Jane"
                  label="Firstname"
                  name="firstname"
                  image="/icons/user.svg"
                  register={register}
                  error={errors}
                  disbale={true}
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Doe"
                  label="Lastname"
                  name="lastname"
                  image="/icons/user.svg"
                  register={register}
                  error={errors}
                  disbale={true}
                />
              </div>
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
                type="text"
                textStyle="md:text-md"
                placeH="14 Avenue St. Street"
                label="Address"
                name="address"
                image="/icons/address.svg"
                register={register}
                error={errors}
              />
              <p className="my-2 text-sm font-avenir text-black/50">
                Detailed street address can help our rider find you quickly.
              </p>
            </div>
            <div className="mt-2">
              <Input
                type="text"
                textStyle="md:text-md"
                placeH="Santasi, Kumasi"
                label="Town"
                name="town"
                error={errors}
                image="/icons/town.svg"
                imageW={26}
                register={register}
              />
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
                error={errors}
              />
            </div>

            <div className="mt-4">
              <Input
                type="text"
                textStyle="md:text-md"
                placeH="Near Boukrom Church Of Pentocost"
                label="Landmark (Optional)"
                name="landmark"
                image="/icons/landmark.svg"
                register={register}
                error={errors}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white py-4 font-avenir font-[500] text-lg cursor-pointer mt-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Processing..." : "Submit"}
        </button>
      </div>

      <div className="flex h-fit w-full md:w-[40%] lg:w-[35%]  flex-col gap-4 flex-none pt-10  ">
        <div className="w-full  bg-white rounded-md px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="font-avenir font-[400] text-sm">MY SHOPPING CART</p>
          </div>
          <div className="mt-4 flex flex-col">
            {cartItems?.map((cart) => (
              <PaymentCard key={cart.id} cart={cart} />
            ))}
          </div>
          <div className="mt-10">
            <div className="w-full flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">TOTAL</p>
              <p className="font-avenir font-[400] text-sm">
                GHS {cartStat?.totalPrice.toFixed(2)}
              </p>
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
        <div className="text-center">
          {payError && (
            <p className="font-avenir text-md text-red-500">{payError}</p>
          )}
        </div>
      </div>
    </form>
  );
}

const PaymentCard = ({ cart }: { cart: CartItemType }) => {
  return (
    <div className="py-4 border-b border-black/10 flex items-end gap-3">
      <div className="w-[30%] md:w-[20%] h-20 lg:h-20 rounded relative overflow-hidden">
        <Image
          src={cart?.mainImage.url}
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
