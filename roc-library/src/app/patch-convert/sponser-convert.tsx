"use client"; // 🔹 บังคับให้เป็น Client Component

import React from "react";
import { BANNER_SRC, useInlineSrc } from "./inlineImages";

export default function SponserConvert() {
  const bannerSrc = useInlineSrc(BANNER_SRC);
  return (
    <div className="w-full">
      <img
        className="w-full"
        src={bannerSrc}
        alt="item image"
        width={150}
        height={300}
        onError={(e) => {
          e.currentTarget.src = "/assets/images/GuildImage/dog.jpg";
        }}
      />
    </div>
  );
}
