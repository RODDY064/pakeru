"use client";

import Input from "@/app/ui/input";
import Link from "next/link";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Submit from "@/app/ui/submit";
import { useRouter } from "next/navigation";
import { useBoundStore } from "@/store/store";

const signUp = z.object({
  firstname: z.string().min(1, { message: "First name is required." }),
  lastname: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type SignUpSchema = z.infer<typeof signUp>;

export default function SigUp() {
  const [signUpState, setSignState] = useState<"loading" | "idle" | "submitted"| "error">("idle")
  const { setUser  } = useBoundStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUp),
  });


  const router = useRouter()


const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
  try {
    const parseResult = signUp.safeParse(data);
    if (!parseResult.success) {
      setSignState('error');
      console.log(parseResult.error);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      setSignState('idle');
      return;
    }

    setSignState('loading');


    const newData = {
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      password: data.password,
    };

    const req = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    const res = await req.json();
    console.log("Server response:", res);

    

    if (req.ok) {
      setUser({
        firstname:newData.firstName,
        lastname:newData.lastName,
        email:newData.email,
        userType:"unverified"
      })
      setSignState('submitted');

      await new Promise((resolve) => setTimeout(resolve, 3000));
      router.push("/otp");

    } else {
      throw new Error(' Error fetching data')
    }

    // Show feedback for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setSignState('idle');

  } catch (error: any) {
    setSignState('error');
    console.error("Catch block error:", error);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    setSignState('idle');
   
  }
};





  return (
    <div className="flex flex-col items-center pt-16 md:py-24 font-avenir">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Create Account
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium my-3 text-center text-gray-700 px-5">
        Enter your details below to create your account.
      </p>
      <div className=" w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%] bg-black/10 h-11 mt-6  flex items-center justify-center rounded">
        <Link
          href="/sign-in"
          className="w-1/2 h-full  cursor-pointer flex items-center justify-center text-black "
        >
          <p className="text-md">Sign in</p>
        </Link>
        <Link
          href="/sign-up"
          className="w-1/2 h-full bg-black cursor-pointer flex items-center justify-center rounded-r text-white">
          <p className="text-md">Sign up</p>
        </Link>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%]"
      >
        <Input
          register={register}
          error={errors}
          image="/icons/user.svg"
          placeH="Jane"
          type="text"
          label="Firstname"
          name="firstname"
        />
        <Input
          register={register}
          error={errors}
          image="/icons/user.svg"
          placeH="Doe"
          type="text"
          label="Lastname"
          name="lastname"
          style="mt-3"
        />
        <Input
          register={register}
          error={errors}
          image="/icons/email.svg"
          placeH="name@gmail.com"
          type="email"
          label="Email"
          name="email"
          style="mt-3"
        />
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          imageW={18}
          imageH={18}
          placeH="*******"
          type="password"
          label="Password"
          name="password"
          style="mt-3"
        />
        <Submit type={signUpState} submitType="sign-up"  />
        <div className="my-2">
          <Link
            href="/forgetten-password"
            className="cursor-pointer text-blue-500 hover:text-black">
            Already have an account? Sign in
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="w-full h-[1px] bg-black/20"></div>
          <p className="text-sm text-black/30">or</p>
          <div className="w-full h-[1px] bg-black/20"></div>
        </div>
        <div className="w-full h-11 border-[0.5px] hover:bg-black/5 transition-all border-black mt-4 rounded font-avenir font-semibold text-black  text-md flex items-center justify-center cursor-pointer overflow-hidden gap-2">
          <Image src="/icons/google.svg" width={16} height={16} alt="google"/>
          <p className="">Google</p>
        </div>
      </form>
    </div>
  );
}
