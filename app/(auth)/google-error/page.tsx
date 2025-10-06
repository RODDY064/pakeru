"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function GoogleErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f2f2f2] p-6 md:p-12">
      <div className="lg:w-[50%] xl:w-[40%] bg-white border border-black/20 rounded-3xl p-4 md:p-8 shadow-sm">
        <h2 className="font-avenir text-xl md:text-2xl font-semibold">
          Sign in with Google
        </h2>

        <p className="mt-3 font-avenir text-md md:text-lg text-red-500">
          {error ??
            "We couldn’t complete your Google sign-in. Please try again or use your credentials instead."}
        </p>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-6 md:mt-8">
          <Link href="/sign-in" className="w-full h-12">
            <div className="w-full h-full rounded-2xl border bg-black text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-black/90">
              <p className="font-avenir">Sign in with credentials</p>
            </div>
          </Link>
          <div
            onClick={() => signIn("google")}
            className="w-full h-12 rounded-2xl border flex items-center gap-3 cursor-pointer justify-center hover:bg-gray-50 transition-colors">
            <p className="font-avenir text-md">Try again with</p>
            <Image
              src="/icons/google.svg"
              width={20}
              height={20}
              alt="google"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f2f2f2]">
          <p className="font-avenir text-gray-500 animate-pulse">
            Loading error details...
          </p>
        </div>
      }>
      <GoogleErrorContent />
    </Suspense>
  );
}
