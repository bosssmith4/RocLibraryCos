import type { ReactNode } from "react";
import { PatchItemsDto } from "@/types/patch";
import HeaderConvertPage from "./header-convert";
import OptionConvertPage from "./option-convert";
import DetailConvertPage from "./detail-convert";
import type { FieldChange } from "@/utils/itemChanges";
import SponserConvert from "./sponser-convert";

interface ItemCardProps {
  /** DOM id: used by Download Image and by the MUAD item shortcuts. */
  id: string;
  item: PatchItemsDto;
  image: ReactNode;
  showSponsor?: boolean;
  /** The patch's change to the description, drawn as marks in its text. */
  change?: FieldChange;
}

/**
 * Item card: one item's tooltip rendered as a shareable image.
 * It is locked to the light theme so the exported PNG looks the same
 * whichever Theme mode the player is browsing in.
 */
export default function ItemCard({
  id,
  item,
  image,
  showSponsor = false,
  change,
}: ItemCardProps) {
  return (
    <div className="@container mx-auto w-full max-w-5xl">
    <article
      id={id}
      data-theme="roc-light"
      className="flex w-full scroll-mt-20 flex-col gap-6 rounded-3xl border border-orange-200 bg-linear-to-tr from-[#fd6c01] to-[#f0d29c] p-4 text-base-content shadow-lg @lg:p-6"
    >
      <div className="grid gap-4 @2xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] @2xl:items-start">
        <HeaderConvertPage item={item} />

        <div className="flex flex-col items-center gap-3 rounded-2xl bg-base-100/90 p-4 shadow-inner">
          {image}
          <OptionConvertPage
            identifiedDescriptionName={item.identifiedDescriptionName}
          />
        </div>

        <DetailConvertPage
          identifiedDescription={item.identifiedDescriptionName}
          change={change}
        />
      </div>

      {showSponsor && <SponserConvert />}
    </article>
    </div>
  );
}
