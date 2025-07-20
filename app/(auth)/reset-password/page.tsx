"use client"

import Input from "@/app/ui/input";
import Submit from "@/app/ui/submit";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPassword() {
 const [signUpState, setSignState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");
    const { register } = useForm()


  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Reset Password
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium my-3 text-center px-10 md:px-auto">
        Enter your email associated with your account <br/> to recievied to changed your password.
      </p>
      <form className="mt-6 px-[2px] w-[85%] md:w-[30%]">
        <Input
           register={register}
           image='/icons/email.svg'
          placeH="name@gmail.com"
          type="password"
          label="New password"
          name="password"
        />
        <Input
           register={register}
           image='/icons/email.svg'
          placeH="name@gmail.com"
          type="password"
          label="Verify password"
          name="password"
          style="mt-3"
        />
        <Submit type="submitted" submitType='sign-in'/>
      </form>
    </div>
  );
}
