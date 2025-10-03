"use client";
import Input from "@/app/ui/input";
import Submit from "@/app/ui/submit";
import { toast } from "@/app/ui/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useApiClient } from "@/libs/useApiClient";
import { signOut } from "next-auth/react";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const [formState, setFormState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { post } = useApiClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    setFormState("loading");
    setErrorMessage(null);

    try {
      const body = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const res = await post<{ data: any; status: any; msg:any }>( "/auth/change-password",body,
        {
          requiresAuth: true,
        }
      );

      console.log(res);

    if (res.msg === "Current password is incorrect") {
        throw new Error(res.msg || "Failed to change password");
      }

      setFormState("submitted");
      toast({
        title: "Password changed successfully!",
        description:
          "Your password has been updated. Redirecting to sign in...",
        variant: "success",
      });

      reset();

        await signOut({ callbackUrl: "/sign-in" });
    } catch (error: any) {
      console.log(error, "error");
      setFormState("error");

      let errorMsg = "Something went wrong.";


      setErrorMessage(errorMsg);
      setTimeout(() => {
        setFormState("idle");
        setErrorMessage(null);
      }, 3000);

      toast.message.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Change Password
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium mb-3 text-balance text-center px-10 md:px-auto">
        Update your account password.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[30%]">
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          placeH="Enter current password"
          type="password"
          label="Current password"
          name="currentPassword"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          placeH="Enter new password"
          type="password"
          label="New password"
          name="newPassword"
          style="mt-3"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Input
          register={register}
          error={errors}
          image="/icons/password.svg"
          placeH="Confirm new password"
          type="password"
          label="Confirm new password"
          name="confirmPassword"
          style="mt-3"
          disabled={formState === "loading" || formState === "submitted"}
        />
        <Submit
          type={formState}
          submitType="change-password"
          errorMessage={errorMessage}
        />
      </form>

      {formState === "submitted" && (
        <p className="mt-4 text-sm text-green-600 font-avenir text-center px-10">
          Your password has been successfully updated!
        </p>
      )}

      <div className="mt-6 text-sm font-avenir flex flex-col items-start text-gray-600 w-[85%] md:w-[30%]">
        <p className="font-semibold mb-2">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>At least 8 characters long</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
          <li>Different from current password</li>
        </ul>
      </div>
    </div>
  );
}
