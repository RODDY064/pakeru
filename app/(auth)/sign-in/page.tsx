"use client";

import Input from "@/app/ui/input";
import Link from "next/link";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import Submit from "@/app/ui/submit";
import { useRouter } from "next/navigation";
import { useBoundStore } from "@/store/store";

const signIn = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type SignInSchema = z.infer<typeof signIn>;

export default function SignIn() {
  const [signInState, setSignState] = useState<
    "loading" | "idle" | "submitted" | "error" | "unverified"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signIn),
  });

  const { user, setUser, completeUserProfile, loadUserToken, storeUserToken } =
    useBoundStore();

  const router = useRouter();

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      const parseResult = signIn.safeParse(data);
      if (!parseResult.success) {
        setSignState("error");
        console.log(parseResult.error);

        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSignState("idle");
        return;
      }

      setSignState("loading");

      const newData = {
        email: data.username,
        password: data.password,
      };

      const req = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            //  "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(newData),
        }
      );

      const res = await req.json();

      // console.log(res);

      if (!req.ok) throw new Error("Failed to sign in");

      if (
        res.msg ===
        "Email not verified. Check your inbox for a verification code."
      ) {
        setErrorMessage("Email not verified. Check your inbox.");
        setSignState("unverified");
        setUser({
          email: newData.email,
          userType: "unverified",
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        router.push("/otp");
        return;
      }

      if (req.ok) {
       

        const res2 = await fetch("/api/product", {
          method: "POST",
          body: JSON.stringify(res),
        });

        setSignState("submitted");
        // storeUserToken(res.token);
        setUser({
          firstname: res.user.firstName,
          lastname: res.user.lastName,
          email: res.user.email,
          userType: "verified",
          role: res.user.role,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        router.push("/");
      } else {
        throw new Error(" Error fetching data");
      }
      // Show feedback for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setSignState("idle");
    } catch (error: any) {
      setSignState("error");
      console.error("Catch block error:", error);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      setSignState("idle");
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 font-avenir">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Welcome Back
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium my-3">
        Please sign-in with your credentials
      </p>
      <div className="w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%] bg-black/10 h-11 mt-6  flex items-center justify-center rounded">
        <Link
          href="/sign-in"
          className="w-1/2 h-full font-avenir bg-black cursor-pointer flex items-center justify-center text-white rounded-l"
        >
          <p className="text-md font-medium">Sign in</p>
        </Link>
        <Link
          href="/sign-up"
          className="w-1/2 h-full  cursor-pointer flex items-center justify-center text-black"
        >
          <p className="text-md font-medium">Sign up</p>
        </Link>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%]"
      >
        <Input
          register={register}
          error={errors}
          image="/icons/email.svg"
          placeH="name@gmail.com"
          type="text"
          label="Username"
          name="username"
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
        <Submit
          type={signInState}
          submitType="sign-in"
          errorMessage={errorMessage}
        />
        <div className="my-2">
          <Link
            href="/forgetten-password"
            className="cursor-pointer text-blue-500 hover:text-black"
          >
            Forgotten password?
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="w-full h-[1px] bg-black/20"></div>
          <p className="text-sm text-black/30 font-avenir">or</p>
          <div className="w-full h-[1px] bg-black/20"></div>
        </div>
        <div className="w-full h-11 border-[0.5px] hover:bg-black/5 transition-all border-black mt-4 rounded font-avenir font-semibold text-black  text-md flex items-center justify-center cursor-pointer overflow-hidden gap-2">
          <Image src="/icons/google.svg" width={16} height={16} alt="google" />
          <p className="">Google</p>
        </div>
      </form>
    </div>
  );
}
