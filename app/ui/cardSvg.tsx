import Image from "next/image";
import React, { useState } from "react";

export default function CardSvg({
  number,
  expires,
  name,
}: {
  number: number;
  expires: string;
  name: String;
}) {
  const [type, setType] = useState<"visa" | "mastercard">("visa");
  return (
    <div>
      <Image
        src="/icons/card-mastercard.svg"
        width={300}
        height={24}
        alt="card"
      />
    </div>
  );
}
