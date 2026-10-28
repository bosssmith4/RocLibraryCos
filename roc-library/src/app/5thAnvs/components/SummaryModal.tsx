import type { PatchItemsDto } from "@/types/patch";
import {
  EXCHANGE_COST,
  WORLD_FRUIT_PER_TICKET,
  REWARD_TYPES,
  rewardTypeOf,
} from "@/services/anniversary/anniversaryService";

interface SummaryModalProps {
  items: Record<string, PatchItemsDto>;
  picked: ReadonlyMap<string, number>;
  imageSrc: (id: string) => string;
  onClear: () => void;
  onClose: () => void;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** What the player picked, grouped by Reward type, and what it all costs. */
export default function SummaryModal({
  items,
  picked,
  imageSrc,
  onClear,
  onClose,
}: SummaryModalProps) {
  const rows = [...picked.entries()].filter(([id]) => items[id]);
  const total = rows.reduce((sum, [, n]) => sum + n, 0);
  const groups = REWARD_TYPES.map((type) => {
    const inType = rows.filter(([id]) => rewardTypeOf(items[id]) === type.id);
    return {
      type,
      rows: inType,
      pieces: inType.reduce((sum, [, n]) => sum + n, 0),
    };
  }).filter((g) => g.rows.length > 0);

  return (
    <dialog
      open
      aria-labelledby="summary-title"
      className="modal modal-open"
      onClick={onClose}
    >
      <div
        className="anvs modal-box flex h-[90vh] max-h-[90vh] w-[95vw] max-w-none flex-col gap-4 sm:w-[80vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="summary-title" className="shrink-0 text-xl font-extrabold">
          สรุปการแลก
        </h2>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {groups.length === 0 && (
            <p className="rounded-box bg-base-200 p-4 text-center text-base-content/70">
              ยังไม่ได้เลือกรางวัล
            </p>
          )}

          {groups.map(({ type, rows: groupRows, pieces }) => (
            <section key={type.id} aria-label={type.name} className="space-y-2">
              <h3 className="flex items-baseline justify-between border-b-2 border-(--anv-orange) pb-1 font-bold">
                <span>{type.name}</span>
                <span className="text-sm">รวม {fmt(pieces)} ชิ้น</span>
              </h3>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {groupRows.map(([id, qty]) => (
                  <li
                    key={id}
                    title={items[id].identifiedDisplayName}
                    className="relative flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br from-(--anv-orange) to-(--anv-cream) p-3 shadow"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc(id)}
                      alt={items[id].identifiedDisplayName}
                      className="h-full w-full object-contain drop-shadow-md"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/GuildImage/dog.jpg";
                      }}
                    />
                    <span className="absolute right-1 top-1 min-w-8 rounded-full bg-(--anv-ink) px-1.5 py-0.5 text-center text-xs sm:text-sm font-black text-(--anv-cream)">
                      ×{qty}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <dl className="shrink-0 space-y-1 rounded-box bg-base-200 p-4">
          <div className="flex justify-between">
            <dt>รวมทั้งหมด</dt>
            <dd className="font-bold">{fmt(total)} ชิ้น</dd>
          </div>
          <div className="flex justify-between">
            <dt>[NFS] Gacha Ticket</dt>
            <dd className="font-bold">{fmt(total * EXCHANGE_COST.gachaTickets)} ใบ</dd>
          </div>
          <div className="flex justify-between text-sm text-base-content/70">
            <dt>คิดเป็น World Fruit (1 Ticket = {fmt(WORLD_FRUIT_PER_TICKET)})</dt>
            <dd className="font-bold">
              {fmt(total * EXCHANGE_COST.gachaTickets * WORLD_FRUIT_PER_TICKET)} ชิ้น
            </dd>
          </div>
          <div className="flex justify-between text-lg">
            <dt className="font-bold">Zeny</dt>
            <dd className="font-black">{fmt(total * EXCHANGE_COST.zeny)}</dd>
          </div>
        </dl>

        <div className="modal-action mt-0 shrink-0">
          {groups.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={onClear}>
              ล้างทั้งหมด
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </dialog>
  );
}
