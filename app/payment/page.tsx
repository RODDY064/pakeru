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
import { toast } from "../ui/toaster";
import { usePaymentProcessing } from "@/libs/paymentFunc";
import { useAuth } from "@/libs/useAuth";
import { useSession } from "next-auth/react";
import Cedis from "../ui/cedis";
import Select from "../ui/select";
import PhoneInput from "../ui/phoneInput";

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
  phoneNumber: z
  .string()
  .regex(/^\+\d(?:[\d\s]{9,19})$/, "Phone number must start with + and contain only digits and spaces (10–15 digits total)"),
  landmark: z.string().optional(),
});

type UserDetailsForm = z.infer<typeof userDetailsSchema>;

export default function Payment() {
  const { cartItems, getCartStats, userData } = useBoundStore();
  const { accessToken } = useAuth();
  const { data: session } = useSession();

  const { processPayment, isProcessing } = usePaymentProcessing();
  const [error, setError] = useState<string>("");

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
    setValue("firstname", session?.user?.firstname as string);
    setValue("useremail", session?.user?.username as string);
    setValue("lastname", session?.user?.lastname as string);
  }, [setValue, session?.user]);


  const onSubmit = async (data: UserDetailsForm) => {
    // Reset previous errors
    setError("");

    
    // Early validation
    if (cartItems.length === 0) {
      const errorMsg = "Your cart is empty!";
      setError(errorMsg);
      toast.error({
        title: errorMsg,
        position: "top-right",
      });
      return;
    }

    // Validate form data
    const validationErrors = validateOrderData(data, cartItems);
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join(", ");
      setError(errorMsg);
      toast.error({
        title: "Validation Error",
        description: errorMsg,
        position: "top-right",
      });
      return;
    }

    // Process payment with toast feedback
    try {
      await toast.promise(
        processPayment(data, cartItems, cartStat, { accessToken }),
        {
          loading: "Processing your order...",
          success: {
            title: "Order Created!",
            description: "Redirecting to secure payment...",
          },
          error: (err: any) => ({
            title: "Payment Failed",
            description:
              err.message + "Please check your details and try again.",
          }),
          position: "top-right",
        }
      );
      console.log(data, "payment");
    } catch (error: any) {
      console.error("Payment submission failed:", error);
      setError(error.message || "Payment processing failed. Please try again.");
    }
  };

  // form validation
  const validateOrderData = (
    data: UserDetailsForm,
    cartItems: CartItemType[]
  ) => {
    const errors: string[] = [];

    if (!data.address?.trim()) errors.push("Address is required");
    if (!data.town?.trim()) errors.push("Town is required");
    if (!data.region?.trim()) errors.push("Region is required");
    if (cartItems.length === 0) errors.push("Cart cannot be empty");

    // Validate cart items have required selections
    cartItems.forEach((item, index) => {
      if (!item.selectedSize) {
        errors.push(`Please select size for item ${index + 1}`);
      }
      if (item.variants && item.variants.length > 0 && !item.selectedColor) {
        errors.push(`Please select color for item ${index + 1}`);
      }
    });

    return errors;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-fit w-[95%] md:w-[94%] lg:w-[80%]  flex-col md:flex-row items-stretch justify-center  gap-4 mt-20"
    >
      <div className="flex w-full    md:w-[60%]  lg:w-[45%] flex-none flex-col  ">
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
        <div className="w-full   bg-white border-[0.5px] border-black/20 mt-3.5 rounded-md px-6 py-6 pb-8">
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
              disabled={true}
            />
            <div className="w-full flex  flex-col md:flex-row items-center justify-between mt-4 gap-2">
              <div className="w-full md:w-1/2">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Jane"
                  label="Firstname"
                  name="firstname"
                  image="/icons/user.svg"
                  register={register}
                  error={errors}
                />
              </div>
              <div className="w-full md:w-1/2">
                <Input
                  type="text"
                  textStyle="md:text-md"
                  placeH="Doe"
                  label="Lastname"
                  name="lastname"
                  image="/icons/user.svg"
                  register={register}
                  error={errors}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-full  bg-white border-[0.5px] border-black/20  mt-3.5 rounded-md px-6 py-6 pb-8">
          <div className="flex items-center justify-between">
            <p className="font-avenir font-[400] text-sm">SHIPPING ADDRESS</p>
          </div>
          <div className="mt-6">
            <div>
              {/* <Input
                type="text"
                textStyle="md:text-md"
                placeH="055xxxxx95"
                label="Phone number"
                name="phoneNumber"
                image="/icons/contacts-b.svg"
                register={register}
                error={errors}
              /> */}
              <PhoneInput
                register={register}
                setValue={setValue}
                label="Phone number"
                name="phoneNumber"
                defaultCountry="GH"
                error={errors}
                image="/icons/contacts-b.svg"
              />
            </div>
            <div className="mt-2">
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
              <Select
                textStyle="md:text-md"
                placeH="Select your region"
                label="Region"
                name="region"
                imageW={24}
                image="/icons/world.svg"
                register={register}
                error={errors}
                options={[
                  { value: "greater-accra", label: "Greater Accra" },
                  { value: "ashanti", label: "Ashanti" },
                  { value: "central", label: "Central" },
                  { value: "eastern", label: "Eastern" },
                  { value: "western", label: "Western" },
                  { value: "western-north", label: "Western North" },
                  { value: "volta", label: "Volta" },
                  { value: "oti", label: "Oti" },
                  { value: "northern", label: "Northern" },
                  { value: "north-east", label: "North East" },
                  { value: "savannah", label: "Savannah" },
                  { value: "upper-east", label: "Upper East" },
                  { value: "upper-west", label: "Upper West" },
                  { value: "bono", label: "Bono" },
                  { value: "bono-east", label: "Bono East" },
                  { value: "ahafo", label: "Ahafo" },
                ]}
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
          className="bg-black text-white py-4 font-avenir f font-[500] text-lg cursor-pointer mt-6 md:block hidden rounded-md disabled:bg-gray-100 disabled:text-black
            disabled:border-black/10 disabled:border
           disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2 justify-center">
              <Image
                src="/icons/loader.svg"
                width={24}
                height={24}
                alt="loader"
              />
              <p className="font-avenir font-[500] text-lg pt-[2px]">
                Processing...
              </p>
            </div>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      <div className="flex min-h-24 w-full md:w-[40%] lg:w-[35%]  flex-col gap-4 flex-none pt-4 md:pt-10  ">
        <div className="w-full  bg-white  border-[0.5px] border-black/20 rounded-md px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="font-avenir font-[400] text-sm">MY SHOPPING CART</p>
          </div>
          <div className="mt-4 flex flex-col">
            {cartItems?.map((cart) => (
              <PaymentCard key={cart._id} cart={cart} />
            ))}
          </div>
          <div className="mt-10">
            <div className="w-full flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">TOTAL</p>
              <div className="flex gap-0.5 items-center  text-sm  ">
                <Cedis cedisStyle="pt-[3px] opacity-80" className="pt-[3px]" />
                <p className=" font-avenir font-[400]  text-sm   pt-[7px]">
                  {cartStat?.totalPrice?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[210px] bg-white  border-[0.5px] border-black/20 rounded-md px-4 py-6 ">
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
            <div className="mb-2">
              <p className="font-avenir font-[400] text-md ">
                Shipping & Delivery
              </p>
              <p className="font-avenir text-sm text-black/50 my-1 ">
                Shipment fees are paid by the customer and vary based on
                delivery distance.
              </p>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white py-4 flex items-center justify-center md:hidden font-avenir font-[500] text-lg cursor-pointer mt-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <p>Processing...</p>
              <Image
                src="/icons/loader.svg"
                width={20}
                height={20}
                alt="loader"
              />
            </div>
          ) : (
            "Submit"
          )}
        </button>
        <div className="text-center">
          {error && <p className="font-avenir text-md text-red-500">{error}</p>}
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
          src={cart?.mainImage.url ?? "/images/image-fallback.png"}
          fill
          className="object-cover"
          alt={cart?.name}
        />
      </div>
      <div>
        <p className="font-avenir font-[400] text-sm uppercase">{cart?.name}</p>
        <div className="flex gap-0.5 items-center  text-sm text-black/50">
          <Cedis cedisStyle="pt-[4px] opacity-40" />
          <p className=" font-avenir font-[400]  text-sm text-black/50  pt-[7px]">
            {cart?.price}
          </p>
        </div>
        <p className="font-avenir  font-[400]  text-xs text-black/50   mt-2">
          QUANTITY: {cart?.quantity}
        </p>
      </div>
    </div>
  );
};
