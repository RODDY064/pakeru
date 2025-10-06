import React from "react";

export default function ResetPasswordMessage() {
  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 text-center">
      <h1 className="text-2xl md:text-4xl  font-avenir font-bold">
        Reset Link Sent ✉️
      </h1>
      <p className="text-balance w-full px-8 md:w-[500px] font-avenir text-sm md:text-lg font-medium my-3 text-black/70  md:px-0 mt-6">
        We’ve sent a password reset link to your email address. 
        Please check your inbox and follow the instructions to create a new password.
      </p>
    </div>
  );
}
