"use client";

import Input from "@/app/ui/input";
import Submit from "@/app/ui/submit";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

const passWrd = z.object({
  email: z.string().min(1, { message: "Email is required." }),
});

export default function Forgotten() {
  const [signUpState, setSignState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");

  const { register, handleSubmit , formState:{ errors } } = useForm<z.infer<typeof passWrd>>({
    resolver: zodResolver(passWrd),
  });

  const onSubmit: SubmitHandler<z.infer<typeof passWrd>> = async (data) => {};

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-manrop font-bold">
        Forgotten Password
      </h1>
      <p className="font-manrop text-md md:text-lg font-medium my-3 text-center px-10 md:px-auto">
        Enter your email associated with your account <br /> to recievied to
        changed your password.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 px-[2px] w-[85%] md:w-[30%]">
        <Input
          register={register}
          error={errors}
          image="/icons/email.svg"
          placeH="name@gmail.com"
          type="text"
          label="Email"
          name="email"
        />
        <Submit type="idle" submitType='sign-in' />
      </form>
    </div>
  );
}
