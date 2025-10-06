"use client";

import Input from "@/app/ui/input";
import Link from "next/link";
import React, { Suspense, useLayoutEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import Submit from "@/app/ui/submit";
import { useBoundStore } from "@/store/store";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const SignInType = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type SignInSchema = z.infer<typeof SignInType>;

// Form component that uses search params
function SignInForm() {
  const [signInState, setSignState] = useState<
    "loading" | "idle" | "submitted" | "error" | "unverified"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(SignInType),
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      router.replace(`/google-error?error=${encodeURIComponent(error)}`);
    }
  }, [searchParams, router]);

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      const parseResult = SignInType.safeParse(data);
      if (!parseResult.success) {
        setSignState("error");
        setErrorMessage("Please check your input");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSignState("idle");
        return;
      }

      setSignState("loading");

      const response = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
      });

      if (!response || response.error) {
        let errorMessage = "Authentication failed";

        switch (response?.error) {
          case "CredentialsSignin":
            errorMessage = "Invalid username or password";
            break;
          case "User not found":
            errorMessage = "User not found";
            break;
          case "CallbackRouteError":
            errorMessage = "Authentication error occurred";
            break;
          default:
            errorMessage = response?.error || "Sign in failed";
        }

        setSignState("error");
        setErrorMessage(errorMessage);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSignState("idle");
        return;
      }

      setSignState("submitted");

      const from = searchParams.get("from") || "/";
      router.replace(from);
    } catch (error: any) {
      setSignState("error");
      setErrorMessage(error.message || "Sign in failed");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setSignState("idle");
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
      setErrorMessage("Failed to initiate Google sign-in");
      setIsGoogleLoading(false);
      setTimeout(() => {
        setSignState("idle");
        setErrorMessage(null);
      }, 3000);
    }
  };

  return (
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
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || signInState === "loading"}
        className="w-full h-11 border-[0.5px] hover:bg-black/5 transition-all border-black mt-4 rounded font-avenir font-semibold text-black text-md flex items-center justify-center cursor-pointer overflow-hidden gap-2"
      >
        <Image src="/icons/google.svg" width={16} height={16} alt="google" />
        <p>Google</p>
      </button>
    </form>
  );
}

export default function SignIn() {
  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 font-avenir">
      <h1 className="text-2xl md:text-4xl font-avenir font-bold">
        Welcome Back
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium text-balance mb-3">
        Please sign-in with your credentials
      </p>
      <div className="w-[85%] md:w-[40%] lg:w-[35%] xl:w-[30%] bg-black/10 h-11 mt-6 flex items-center justify-center rounded">
        <Link
          href="/sign-in"
          className="w-1/2 h-full font-avenir bg-black cursor-pointer flex items-center justify-center text-white rounded-l"
        >
          <p className="text-md font-medium">Sign in</p>
        </Link>
        <Link
          href="/sign-up"
          className="w-1/2 h-full cursor-pointer flex items-center justify-center text-black"
        >
          <p className="text-md font-medium">Sign up</p>
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
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
