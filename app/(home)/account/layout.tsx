import AccountWrapper from "@/app/ui/accountWrapper";
import React from "react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-black  pt-[6.45rem] relative">
    <AccountWrapper>
        {children}
    </AccountWrapper>
    </div>
  );
}
