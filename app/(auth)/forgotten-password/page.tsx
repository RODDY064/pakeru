"use client";
import Input from "@/app/ui/input";
import Submit from "@/app/ui/submit";
import { toast } from "@/app/ui/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Forgotten() {
  const [formState, setFormState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setFormState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to send reset link");
      }

      // Success
      setFormState("submitted");
      toast({
        title: "Reset link sent!",
        description: `If an account exists with ${data.email}, you will receive a password reset link shortly.`,
        variant: "success",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/forgotten-password/message");
      }, 3000);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormState("idle");
        reset();
      }, 5000);
    } catch (error: any) {
      setFormState("error");
      const errorMsg =
        error?.message || "Something went wrong. Please try again.";
      setErrorMessage(errorMsg);

      toast({
        title: "Failed to send reset link",
        description: errorMsg,
        variant: "error",
      });

      // Reset to idle after 4 seconds
      setTimeout(() => {
        setFormState("idle");
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-2xl md:text-4xl  font-avenir font-bold">
        Forgotten Password
      </h1>
      <p className="font-avenir text-md md:text-lg text-balance  font-medium mb-3 text-center  px-4 md:px-10 md:px-auto">
        Enter your email associated with your account{" "}
        <br className="md:flex hidden" /> to receive a link to reset your
        password.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[30%]"
      >
        <Input
          register={register}
          error={errors}
          image="/icons/email.svg"
          placeH="name@gmail.com"
          type="email"
          label="Email"
          name="email"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Submit
          type={formState}
          submitType="forgot-password"
          errorMessage={errorMessage}
        />
      </form>

      {formState === "submitted" && (
        <p className="mt-4 text-sm text-green-600 font-avenir text-center px-10">
          Check your email inbox and spam folder for the reset link.
        </p>
      )}
    </div>
  );
}
