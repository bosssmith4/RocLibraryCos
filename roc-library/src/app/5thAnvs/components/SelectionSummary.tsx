import { EXCHANGE_COST, WORLD_FRUIT_PER_TICKET } from "@/services/anniversary/anniversaryService";

interface SelectionSummaryProps {
  /** how many different rewards are picked */
  kinds: number;
  /** how many exchanges in all (a reward can be picked more than once) */
  count: number;
  onOpen: () => void;
  onClear: () => void;
}

const ART = "/assets/images/anvs/landing";

/** Bar pinned to the bottom of the screen: the running total, and the way into the full summary. */
export default function SelectionSummary({ kinds, count, onOpen, onClear }: SelectionSummaryProps) {
  if (count === 0) return null;
  const tickets = count * EXCHANGE_COST.gachaTickets;
  const zeny = count * EXCHANGE_COST.zeny;

  return (
    <div
      role="status"
      className="sticky bottom-3 z-30 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border-2 border-(--anv-orange) bg-base-100 px-5 py-3 shadow-xl"
    >
      <p className="font-bold">
        เลือก {kinds} รายการ ({count} ชิ้น)
      </p>
      <p className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 rounded-full bg-info py-1 pl-2 pr-4 text-lg font-black text-info-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/ticket.svg`} alt="" aria-hidden className="h-7 w-7" />
          Ticket ×{tickets.toLocaleString("en-US")}
          <span className="text-sm font-bold opacity-80">
            = {(tickets * WORLD_FRUIT_PER_TICKET).toLocaleString("en-US")} World Fruit
          </span>
        </span>
        <span className="flex items-center gap-2 rounded-full bg-warning py-1 pl-2 pr-4 text-lg font-black text-warning-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/coin.svg`} alt="" aria-hidden className="h-7 w-7" />
          {zeny.toLocaleString("en-US")} Zeny
        </span>
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-sm btn-outline" onClick={onClear}>
          ล้าง
        </button>
        <button
          type="button"
          className="btn btn-sm border-0 bg-(--anv-orange) text-(--anv-ink)"
          onClick={onOpen}
        >
          ดูสรุป
        </button>
      </div>
    </div>
  );
}
