import CollectionsContent from "@/app/ui/CollectionsContent";
import React from "react";

export default async function Collections({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full min-h-screen  flex flex-col items-center  text-black   transition-all  px-4 md:px-8  pb-36 overflow-hidden">
      <CollectionsContent/>
    </div>
  );
}


