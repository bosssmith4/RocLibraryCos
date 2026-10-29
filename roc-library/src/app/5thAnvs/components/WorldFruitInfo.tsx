"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Info, X } from "lucide-react";
import { WORLD_FRUIT_SOURCES } from "@/data/anniversary5thGuide";
import { WORLD_FRUIT_PER_TICKET } from "@/services/anniversary/anniversaryService";
import { CutoutPicture } from "./QuestTaskRow";

/** The window: every way to get World Fruit, how much, and where to go to do it. */
export function WorldFruitModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  return (
    <dialog
      open
      aria-labelledby="world-fruit-title"
      className="modal modal-open z-50"
      onClick={onClose}
    >
      <div
        className="anvs modal-box flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex shrink-0 items-center gap-4 bg-(--anv-orange) px-5 py-4 text-(--anv-ink)">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-base-100 shadow-md">
            <CutoutPicture
              src="/assets/images/anvs/items/6435.bmp"
              className="h-12 w-12 object-contain"
              fallback={null}
            />
          </span>
          <div className="min-w-0 pr-10">
            <h2 id="world-fruit-title" className="text-2xl font-black leading-tight">
              World Fruit ได้จากไหน
            </h2>
            <p className="font-bold">
              Gacha Ticket 1 ใบ = {WORLD_FRUIT_PER_TICKET.toLocaleString("en-US")} World Fruit
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-base-100/30 hover:bg-base-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </header>

        <ul className="min-h-0 flex-1 divide-y divide-base-300 overflow-y-auto px-5 py-2">
          {WORLD_FRUIT_SOURCES.map((s) => (
            <li key={s.source} className="flex items-center gap-4 py-3">
              <span className="flex min-h-16 min-w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-(--anv-cream)/50 px-2 py-2 text-(--anv-ink)">
                <span className="text-2xl font-black leading-none">{s.amount.toLocaleString("en-US")}</span>
                <span className="text-xs font-bold leading-none">{s.unit}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-black leading-snug">{s.source}</span>
                <span className="block text-sm leading-snug text-base-content/70">{s.detail}</span>
              </span>
              <a
                href={s.href}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-(--anv-ink)/30 px-3 py-1 text-sm font-black hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anv-orange)"
              >
                ดูวิธีทำ
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>

        <footer className="shrink-0 border-t border-base-300 px-5 py-3 text-right">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            ปิด
          </button>
        </footer>
      </div>
    </dialog>
  );
}

/**
 * The way into the World Fruit window, in three sizes so it reads as a button wherever it sits:
 * `button` is a full labelled button with the fruit on it, `chip` a small labelled pill that fits
 * inside a line of figures, and `icon` the bare "i" for a tight spot.
 */
export default function WorldFruitInfo({
  variant = "icon",
  className = "",
}: {
  variant?: "button" | "chip" | "icon";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const label = "World Fruit หาจากไหนได้บ้าง";
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anv-orange)";
  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          variant === "button"
            ? `group flex w-full cursor-pointer items-center gap-2 rounded-full bg-(--anv-ink) py-1.5 pl-1.5 pr-4 text-left text-base font-black text-(--anv-cream) shadow transition-transform hover:-translate-y-0.5 hover:shadow-md ${focus} ${className}`
            : variant === "chip"
              ? `inline-flex cursor-pointer items-center gap-1 rounded-full border-2 border-current px-2.5 py-0.5 text-sm font-black hover:bg-base-100/40 ${focus} ${className}`
              : `inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-current align-middle opacity-80 hover:opacity-100 ${focus} ${className}`
        }
      >
        {variant === "button" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-100">
            <CutoutPicture
              src="/assets/images/anvs/items/6435.bmp"
              className="h-7 w-7 object-contain"
              fallback={null}
            />
          </span>
        )}
        {variant === "button" ? (
          <>
            <span className="min-w-0 flex-1 leading-tight">World Fruit หาจากไหนได้บ้าง</span>
            <Info aria-hidden className="h-5 w-5 shrink-0" strokeWidth={3} />
          </>
        ) : variant === "chip" ? (
          <>
            <Info aria-hidden className="h-4 w-4" strokeWidth={3} />
            หาจากไหน
          </>
        ) : (
          <Info aria-hidden className="h-4 w-4" strokeWidth={3} />
        )}
      </button>
      {open && createPortal(<WorldFruitModal onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
