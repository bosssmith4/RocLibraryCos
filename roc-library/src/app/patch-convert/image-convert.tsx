"use client";
import { useInlineSrc } from "./inlineImages";

export default function ImageConvertPage({ patchKey }: { patchKey: string }) {
  const src = useInlineSrc(`/assets/images/PatchImage/${patchKey}.bmp`);
  return (
    <div className="image-item flex items-center justify-center p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="rounded-xl"
        src={src}
        alt={`ภาพไอเทมรหัส ${patchKey}`}
        width={150}
        height={300}
        onError={(e) => {
          e.currentTarget.src = "/assets/images/GuildImage/dog.jpg";
        }}
      />
    </div>
  );
}
