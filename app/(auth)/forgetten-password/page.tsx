import Input from "@/app/ui/input";
import React from "react";

export default function Forgotten() {
  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-manrop font-bold">
        Forgotten Password
      </h1>
      <p className="font-manrop text-md md:text-lg font-medium my-3 text-center px-10 md:px-auto">
        Enter your email associated with your account <br/> to recievied to changed your password.
      </p>
      <form className="mt-6 px-[2px] w-[85%] md:w-[30%]">
        <Input
           image='/icons/email.svg'
          placeH="name@gmail.com"
          type="text"
          label="Email"
          name="email"
        />
        <input
          className="w-full h-11 bg-black mt-8 rounded font-manrop font-semibold  text-white text-md cursor-pointer hover:bg-transparent hover:border-black border hover:text-black"
          type="submit"
        />
      </form>
    </div>
  );
}
