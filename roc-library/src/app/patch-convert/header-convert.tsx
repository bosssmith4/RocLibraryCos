import { PatchItemsDto } from "@/types/patch";
import { LOGO_SRC, useInlineSrc } from "./inlineImages";

export default function HeaderConvertPage({ item }: { item: PatchItemsDto }) {
  const logoSrc = useInlineSrc(LOGO_SRC);
  return (
    <h2 className="inline-flex w-fit max-w-full items-center rounded-2xl bg-[#f7641a] px-4 py-3 text-xl font-extrabold text-white shadow-md @lg:px-6 @lg:text-3xl @2xl:col-span-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mr-3 h-10 w-10 shrink-0 rounded-xl @lg:h-12 @lg:w-12"
        alt=""
        width={50}
        height={50}
        src={logoSrc}
      />
      <span className="min-w-0 wrap-break-word">
        {item.identifiedDisplayName}{" "}
        {!item.costume && item.slotCount > 0 && <span>[{item.slotCount}]</span>}
      </span>
    </h2>
  );
}
