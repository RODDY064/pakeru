"use client";
import Input from "@/app/ui/input";
import Submit from "@/app/ui/submit";
import { toast } from "@/app/ui/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [formState, setFormState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "error",
      });
      setTimeout(() => router.push("/auth/forgot-password"), 2000);
    }
  }, [token, router]);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) {
      setErrorMessage("Invalid or missing reset token");
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      // Success
      setFormState("submitted");
      toast({
        title: "Password reset successful!",
        description: "Your password has been changed. Redirecting to sign in...",
        variant: "success",
      });

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);

    } catch (error: any) {
      setFormState("error");
      const errorMsg = error?.message || "Something went wrong. Please try again.";
      setErrorMessage(errorMsg);
      
      toast({
        title: "Failed to reset password",
        description: errorMsg,
        variant: "error",
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setFormState("idle");
        setErrorMessage(null);
      }, 3000);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center pt-16 md:pt-24">
        <h1 className="text-3xl md:text-4xl font-avenir font-bold">
          Invalid Reset Link
        </h1>
        <p className="font-avenir text-md md:text-lg font-medium mb-3 text-balance text-center px-10">
          This password reset link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Reset Password
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium my-3 text-center px-10 md:px-auto">
        Enter your new password below. 
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[30%]">
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          placeH="Enter new password"
          type="password"
          label="New password"
          name="password"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          placeH="Confirm new password"
          type="password"
          label="Confirm password"
          name="confirmPassword"
          style="mt-3"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Submit
          type={formState}
          submitType="reset-password"
          errorMessage={errorMessage}
        />
      </form>
      
      {formState === "submitted" && (
        <p className="mt-4 text-sm text-green-600 font-avenir text-center px-10">
          Redirecting you to sign in...
        </p>
      )}

      <div className="mt-6 text-sm font-avenir flex flex-col items-start text-gray-600 w-[85%] md:w-[30%] ">
        <p className="font-semibold mb-2">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>At least 8 characters long</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
        </ul>
      </div>
    </div>
  );
}