"use client";

import Input from "@/app/ui/input";
import Link from "next/link";
import React, { Suspense, useLayoutEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Submit from "@/app/ui/submit";
import { useRouter, useSearchParams } from "next/navigation";
import { useBoundStore } from "@/store/store";
import { signIn } from "next-auth/react";

const signUp = z.object({
  firstname: z.string().min(1, { message: "First name is required." }),
  lastname: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type SignUpSchema = z.infer<typeof signUp>;

function SignUpForm() {
  const [signUpState, setSignState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const [signupError, setSignUpError] = useState<string | null>(null);

  const { setUser } = useBoundStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUp),
  });

  const router = useRouter();

  useLayoutEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      router.replace(`/google-error?error=${encodeURIComponent(error)}`);
    }
  }, [searchParams, router]);

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    const parseResult = signUp.safeParse(data);
    if (!parseResult.success) {
      setSignState("error");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setSignState("idle");
      return;
    }

    try {
      setSignState("loading");

      const payload = {
        firstName: data.firstname.trim(),
        lastName: data.lastname.trim(),
        email: data.email.trim(),
        password: data.password,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      console.log("Server response:", json);

      if (!res.ok) {
        throw new Error(json?.message  || "Failed to create an account");
      }

      setUser({
        firstname: payload.firstName,
        lastname: payload.lastName,
        email: payload.email,
        userType: "unverified",
      });

      setSignState("submitted");
      setSignUpError(null);

      // Allow user to see success message before redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/otp");
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setSignState("error");
      setSignUpError(error?.message || "Failed to create an account");

      await new Promise((resolve) => setTimeout(resolve, 3000));
    } finally {
      setSignState("idle");
      setSignUpError(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", {
        callbackUrl: "/",
        errorRedirect: "/google",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setSignState("error");
      setIsGoogleLoading(false);
      setTimeout(() => {
        setSignState("idle");
      }, 3000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 px-[2px] w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%]">
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
      <Submit 
      type={signUpState} 
      submitType="sign-up" 
      errorMessage={signupError} />
      <div className="my-2">
        <Link
          href="/sign-in"
          className="cursor-pointer text-blue-500 hover:text-black">
          Already have an account? Sign in
        </Link>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="w-full h-[1px] bg-black/20"></div>
        <p className="text-sm text-black/30">or</p>
        <div className="w-full h-[1px] bg-black/20"></div>
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || signUpState === "loading"}
        className="w-full h-11 border-[0.5px] hover:bg-black/5 transition-all border-black mt-4 rounded font-avenir font-semibold text-black  text-md flex items-center justify-center cursor-pointer overflow-hidden gap-2">
        <Image src="/icons/google.svg" width={16} height={16} alt="google" />
        <p className="">Google</p>
      </button>
    </form>
  );
}

export default function SigUp() {
  return (
    <div className="flex flex-col items-center py-16 md:py-24 font-avenir">
      <h1 className="text-2xl md:text-4xl font-avenir font-bold">
        Create Account
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium mb-3 text-balance text-center text-gray-700 px-5">
        Enter your details below to create your account.
      </p>
      <div className=" w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%] bg-black/10 h-11 mt-6  flex items-center justify-center rounded">
        <Link
          href="/sign-in"
          className="w-1/2 h-full  cursor-pointer flex items-center justify-center text-black ">
          <p className="text-md">Sign in</p>
        </Link>
        <Link
          href="/sign-up"
          className="w-1/2 h-full bg-black cursor-pointer flex items-center justify-center rounded-r text-white">
          <p className="text-md">Sign up</p>
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="mt-6 w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%] flex justify-center py-8">
            <Image
              src="/icons/loader.svg"
              width={34}
              height={34}
              alt="Loading form"
            />
          </div>
        }>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
