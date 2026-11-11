"use client";
import { useInlineSrc } from "./inlineImages";

/** The game's own picture of the item, or a card's Card illustration in its place. */
export default function ImageConvertPage({
  patchKey,
  illustration,
}: {
  patchKey: string;
  /** URL of the Card illustration, when the item is a card. */
  illustration?: string;
}) {
  const src = useInlineSrc(
    illustration ?? `/assets/images/PatchImage/${patchKey}.bmp`,
  );
  return (
    <div className="image-item flex items-center justify-center p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={illustration ? "h-auto max-w-full rounded-xl" : "rounded-xl"}
        src={src}
        alt={
          illustration
            ? `ภาพการ์ดรหัส ${patchKey}`
            : `ภาพไอเทมรหัส ${patchKey}`
        }
        // A Card illustration is 300×400; it shows at three quarters, shrinking on a narrow screen.
        width={illustration ? 225 : 150}
        height={300}
        onError={(e) => {
          e.currentTarget.src = "/assets/images/GuildImage/dog.jpg";
        }}
      />
    </div>
  );
}
