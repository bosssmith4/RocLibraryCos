"use client";
import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { PatchItemsDto } from "@/types/patch";

const FALLBACK_IMAGE = "/assets/images/GuildImage/dog.jpg";

type Entry = [string, PatchItemsDto];

interface ItemPickerProps {
  entries: Entry[];
  /** How many items the patch holds before the search narrows the list. */
  total: number;
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** Items that are cards (they have a Card illustration). */
  cards: Record<string, string>;
}

function Thumbnail({ patchKey }: { patchKey: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/images/PatchImage/${patchKey}.bmp`}
      alt=""
      width={40}
      height={56}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK_IMAGE;
      }}
      className="h-14 w-10 shrink-0 rounded-md bg-base-100 object-contain"
    />
  );
}

function ItemRow({
  patchKey,
  item,
  selected,
  card,
  onSelect,
}: {
  patchKey: string;
  item: PatchItemsDto;
  selected: boolean;
  card: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(patchKey)}
      aria-current={selected ? "true" : undefined}
      className={`flex min-h-16 w-full items-center gap-3 rounded-box border p-2 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/10"
          : "border-transparent hover:border-base-300 hover:bg-base-100"
      }`}
    >
      <Thumbnail patchKey={patchKey} />
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm font-semibold text-base-content">
          {item.identifiedDisplayName}
        </span>
        <span className="mt-0.5 block text-xs text-base-content/60">
          รหัส {patchKey}
          {item.costume && " · Costume"}
          {card && " · Card"}
        </span>
      </span>
    </button>
  );
}

/**
 * The phone-width picker. A native dropdown cannot show pictures, so this is a button
 * that opens a list of the same rows as the wide list.
 */
function MobileSelect({
  entries,
  selectedKey,
  onSelect,
  cards,
}: {
  entries: Entry[];
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  cards: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const current = entries.find(([key]) => key === selectedKey);

  const choose = (key: string) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <div
      className="relative lg:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="เลือกไอเทม"
        className="flex min-h-16 w-full items-center gap-3 rounded-box border border-base-300 bg-base-100 p-2 text-left"
      >
        {current ? (
          <>
            <Thumbnail patchKey={current[0]} />
            <span className="line-clamp-2 min-w-0 grow text-sm font-semibold">
              {current[1].identifiedDisplayName}
            </span>
          </>
        ) : (
          <span className="grow text-sm text-base-content/60">เลือกไอเทม</span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          {/* A tap anywhere outside the list closes it. */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <ul
            aria-label="รายการไอเทม"
            className="absolute inset-x-0 z-20 mt-1 max-h-[60dvh] space-y-1 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1.5 shadow-lg"
          >
            {entries.map(([key, item]) => (
              <li key={key}>
                <ItemRow
                  patchKey={key}
                  item={item}
                  selected={key === selectedKey}
                  card={key in cards}
                  onSelect={choose}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Search plus the patch's items. From the lg width it is a list that stays beside the
 * stage; below that it folds into a single dropdown so the card keeps the screen.
 */
export default function ItemPicker({
  entries,
  total,
  selectedKey,
  onSelect,
  query,
  onQueryChange,
  cards,
}: ItemPickerProps) {
  const searching = query.trim() !== "";

  return (
    <div className="space-y-3 lg:sticky lg:top-20">
      <div className="flex items-center gap-2">
        <label className="input input-bordered flex min-h-11 w-full items-center gap-2">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 opacity-60" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ค้นหาชื่อไอเทม"
            aria-label="ค้นหาชื่อไอเทม"
            className="grow"
          />
        </label>
        {searching && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="ล้างคำค้นหา"
            className="btn btn-ghost btn-square min-h-11 min-w-11"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      <p role="status" className="text-xs text-base-content/60">
        {searching
          ? `พบ ${entries.length} จาก ${total} ไอเทม`
          : `${total} ไอเทมในแพตช์นี้`}
      </p>

      {entries.length === 0 ? (
        <p className="rounded-box border border-dashed border-base-300 p-4 text-center text-sm text-base-content/70">
          {total === 0
            ? "ยังไม่มีข้อมูลไอเทมในแพตช์นี้"
            : "ไม่พบไอเทมที่ตรงกับคำค้นหา"}
        </p>
      ) : (
        <>
          {/* Narrow screens: a dropdown whose rows carry the item's picture. */}
          <MobileSelect
            entries={entries}
            selectedKey={selectedKey}
            onSelect={onSelect}
            cards={cards}
          />

          {/* Wide screens: a list that scrolls on its own. */}
          <nav
            aria-label="รายการไอเทม"
            className="hidden max-h-[calc(100dvh-14rem)] overflow-y-auto lg:block"
          >
            <ul className="space-y-1.5 pr-1">
              {entries.map(([key, item]) => (
                <li key={key}>
                  <ItemRow
                    patchKey={key}
                    item={item}
                    selected={key === selectedKey}
                    card={key in cards}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
