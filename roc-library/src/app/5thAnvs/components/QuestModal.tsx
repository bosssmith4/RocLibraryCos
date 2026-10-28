"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, MapPin, X } from "lucide-react";
import type { AnniversaryInfoEntry, ChapterQuest } from "@/types/anniversary";
import { splitCoordinates, type MapCoordinate } from "@/utils/mapCoordinate";
import CoordinateLink, { CoordinateGroupLink, CoordinateText } from "./CoordinateLink";
import { RewardBox } from "./QuestParts";
import QuestTaskRow from "./QuestTaskRow";

/** A map coordinate: press it to see the map with a pin on the spot, or press the small button to copy it. */
function CoordinateChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const coordinate = splitCoordinates(value).find((piece) => typeof piece !== "string");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // the clipboard can be blocked; the text is still there to read
    }
  };
  return (
    <li className="flex items-center overflow-hidden rounded-full border-2 border-(--anv-orange) bg-base-100">
      {coordinate ? (
        <CoordinateLink
          coordinate={coordinate}
          className="anvs-link flex cursor-pointer items-center gap-1.5 py-1 pl-3 pr-2 font-mono text-sm font-bold hover:bg-(--anv-orange)/20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--anv-orange)"
        />
      ) : (
        <span className="py-1 pl-3 pr-2 font-mono text-sm font-bold">{value}</span>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={`คัดลอก ${value}`}
        className="flex cursor-pointer items-center self-stretch border-l-2 border-(--anv-orange) px-2 hover:bg-(--anv-orange)/20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--anv-orange)"
      >
        {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4 opacity-70" />}
      </button>
    </li>
  );
}

/**
 * The quest of the Chapter the player clicked, in a window: what to do, notes and,
 * for the last Chapter, the coordinates. Esc, the × button or a click outside closes it.
 */
export default function QuestModal({
  quest,
  entry,
  color,
  onClose,
}: {
  quest: ChapterQuest;
  entry: AnniversaryInfoEntry;
  color: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // the map re-renders while the window is open; keep the latest handler without re-running the effect below
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
      aria-labelledby="quest-title"
      className="modal modal-open"
      onClick={onClose}
    >
      <div
        className="anvs modal-box max-w-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-base-100 text-xl font-black text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            {entry.numeral}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-lg font-black tracking-wide text-(--anv-orange)">
              {quest.town} · {quest.kind}
            </p>
            <h2 id="quest-title" className="text-2xl font-black leading-tight sm:text-3xl">
              {quest.gameTitle}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-(--anv-orange)"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {quest.intro && <p className="text-base-content/80">{quest.intro}</p>}

        {quest.requirements && (
          <div className="space-y-1.5">
            <p className="text-base font-black">เงื่อนไขรับเควส</p>
            <ul className="flex flex-wrap gap-2">
              {quest.requirements.map((r) => (
                <li key={r} className="flex items-center gap-1.5 rounded-full border-2 border-(--anv-orange) bg-(--anv-orange)/15 px-3.5 py-1.5 text-base font-black">
                  <Check aria-hidden className="h-5 w-5 text-(--anv-orange)" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {quest.steps && (
          <div className="space-y-1.5">
            <p className="text-sm font-black">ขั้นตอน</p>
            <ol className="space-y-2 text-sm">
              {quest.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: color }}>
                    {i + 1}
                  </span>
                  <span className="pt-0.5">
                    <CoordinateText text={step} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <ul className="grid gap-2 sm:grid-cols-2">
          {quest.tasks.map((task) => (
            <QuestTaskRow key={task.label} task={task} />
          ))}
        </ul>

        {quest.quizAnswers && (
          <div className="space-y-2">
            <p className="text-base font-black">เฉลยคำตอบ</p>
            <ol className="grid gap-2 sm:grid-cols-2">
              {quest.quizAnswers.map((answer, i) => (
                <li
                  key={answer}
                  className="flex items-center gap-3 rounded-xl border-2 border-success bg-success/10 px-3 py-2"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-sm font-black text-success-content">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-black">{answer}</span>
                  <Check aria-label="คำตอบที่ถูก" className="h-6 w-6 shrink-0 text-success" strokeWidth={3} />
                </li>
              ))}
            </ol>
          </div>
        )}

        {quest.coordinates && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">พิกัดกล่อง (กดเพื่อดูบนแมพ)</p>
              <CoordinateGroupLink
                coordinates={quest.coordinates.flatMap((value) =>
                  splitCoordinates(value).filter((piece): piece is MapCoordinate => typeof piece !== "string"),
                )}
                className="btn btn-sm gap-2 border-0 bg-(--anv-orange) text-(--anv-ink)"
              >
                <MapPin aria-hidden className="h-4 w-4" />
                ดูทุกจุด ({quest.coordinates.length})
              </CoordinateGroupLink>
            </div>
            <ul className="flex flex-wrap gap-2">
              {quest.coordinates.map((c) => (
                <CoordinateChip key={c} value={c} />
              ))}
            </ul>
          </div>
        )}

        {quest.rewards && <RewardBox compact title="รางวัลเมื่อเควสสำเร็จ" tasks={quest.rewards} />}

        {quest.outro && <p className="font-bold">{quest.outro}</p>}
        {quest.notes?.map((note) => (
          <p key={note} className="rounded-xl bg-warning/20 px-3 py-2 text-sm">
            {note}
          </p>
        ))}

        <div className="modal-action mt-2">
          <button type="button" className="btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </dialog>
  );
}
