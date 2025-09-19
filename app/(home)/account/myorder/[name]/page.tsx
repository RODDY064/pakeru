import React from "react";
import { useAccount } from "../../account-context";
import Image from "next/image";
import Link from "next/link";
import MyOrderDynamic from "@/app/ui/myOrderDynamic";

export default async function page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <>{<MyOrderDynamic name={name} />}</>;
}
