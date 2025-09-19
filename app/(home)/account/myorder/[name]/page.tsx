import React from "react";
import MyOrderDynamic from "@/app/ui/myOrderDynamic";

export default async function page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <>{<MyOrderDynamic name={name} />}</>;
}
