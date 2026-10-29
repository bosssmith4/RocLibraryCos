import { ArrowRightLeft } from "lucide-react";
import type { QuestTaskExchange } from "@/types/anniversary";
import { CutoutPicture } from "./QuestTaskRow";

/**
 * A small mark on a reward that can be turned into something else, e.g. Black Soul into World
 * Fruit. It stays smaller than the reward's own name, so it points out the fact without
 * competing with it: a thin orange outline and the target item's picture.
 */
export default function ExchangeTag({ exchange }: { exchange: QuestTaskExchange }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-(--anv-orange) bg-(--anv-orange)/10 py-0.5 pl-2 pr-2.5 text-xs font-black leading-none">
      <ArrowRightLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-(--anv-orange)" strokeWidth={3} />
      แลกได้เป็น
      {exchange.itemImageId !== undefined && (
        <CutoutPicture
          src={`/assets/images/anvs/items/${exchange.itemImageId}.bmp`}
          className="h-5 w-5 shrink-0 object-contain"
          fallback={null}
        />
      )}
      {exchange.label}
      <span className="rounded-full bg-(--anv-ink) px-1.5 py-0.5 text-[0.7rem] text-(--anv-cream)">{exchange.rate}</span>
    </span>
  );
}
