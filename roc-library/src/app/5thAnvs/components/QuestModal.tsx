"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Copy, Flag, MapPin, X } from "lucide-react";
import type { AnniversaryInfoEntry, ChapterQuest } from "@/types/anniversary";
import { splitCoordinates, type MapCoordinate } from "@/utils/mapCoordinate";
import CoordinateLink, { CoordinateGroupLink, CoordinateText } from "./CoordinateLink";
import ChapterRef, { chapterNumberIn } from "./ChapterRef";
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

/** True when white text would be hard to read on this #rrggbb colour. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6;
}

/** A labelled block of the sheet: a small heading with a bar in the Chapter's colour, then its content. */
function Block({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-base font-black">
        <span aria-hidden className="h-5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * The quest of the Chapter the player clicked, as a briefing sheet. The header band takes the
 * Chapter's colour and names the quest; below it come, in order of importance: who may start it,
 * what to bring or kill, the way there, the remarks and what it gives. Esc, the × button or a
 * click outside closes it.
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

  // "Chapter II - Foundation : จุดเริ่มต้นของประเทศ" -> the English name on top, the Thai one below
  const [nameEn, nameTh] = quest.gameTitle.split(/\s+:\s+/);
  const logo = entry.logo ?? entry.art;
  const light = isLight(color);
  const onBand = light ? "text-(--anv-ink)" : "text-white";
  // a quiz Chapter shows its answers instead of the "answer everything" task
  const goals = quest.quizAnswers ? quest.tasks.filter((t) => t.kind !== "quiz") : quest.tasks;
  const quizTask = quest.tasks.find((t) => t.kind === "quiz");

  return (
    <dialog open aria-labelledby="quest-title" className="modal modal-open" onClick={onClose}>
      <div
        className="anvs modal-box flex max-h-[92vh] max-w-3xl flex-col overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className={`relative flex shrink-0 items-center gap-4 px-5 py-4 sm:px-6 ${onBand}`}
          style={{ backgroundColor: color }}
        >
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-base-100 text-2xl font-black shadow-md sm:h-20 sm:w-20 sm:text-3xl"
            style={{ color: light ? "var(--anv-ink)" : color }}
          >
            {entry.numeral}
          </span>
          <div className="min-w-0 flex-1 space-y-0.5 pr-10">
            <p className="text-sm font-black uppercase tracking-widest opacity-90">
              {quest.town} · {quest.kind}
            </p>
            <h2 id="quest-title" className="text-2xl font-black leading-tight sm:text-3xl">
              {nameEn}
            </h2>
            {nameTh && <p className="text-lg font-bold leading-snug">{nameTh}</p>}
          </div>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.src}
              alt={logo.alt}
              className="mr-10 hidden h-20 w-20 shrink-0 object-contain drop-shadow sm:block"
            />
          )}
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className={`absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-base-100/25 hover:bg-base-100/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${onBand}`}
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {quest.intro && <p className="text-base italic text-base-content/80">“{quest.intro}”</p>}

          {quest.requirements && (
            <Block title="เงื่อนไขรับเควส" color={color}>
              <ul className="grid gap-x-6 gap-y-1.5 rounded-xl bg-base-200 p-3 sm:grid-cols-2">
                {quest.requirements.map((r) => {
                  const chapter = /^จบ Chapter/.test(r) ? chapterNumberIn(r) : null;
                  return (
                    <li key={r} className="flex items-start gap-2 font-bold leading-snug">
                      <Check aria-hidden className="mt-1 h-5 w-5 shrink-0 text-success" strokeWidth={3} />
                      {chapter ? (
                        <span className="flex flex-wrap items-center gap-2">
                          จบ <ChapterRef n={chapter} showTown={false} /> แล้ว
                        </span>
                      ) : (
                        r
                      )}
                    </li>
                  );
                })}
              </ul>
            </Block>
          )}

          {(goals.length > 0 || quest.quizAnswers || quest.coordinates) && (
            <Block title={quest.quizAnswers ? "เฉลยคำตอบ" : "เป้าหมาย"} color={color}>
              {quest.quizAnswers && quizTask?.count && (
                <p className="text-sm text-base-content/70">
                  ตอบให้ถูกทั้ง {quizTask.count} ข้อ · เรียงตามลำดับคำถาม
                </p>
              )}
              {goals.length > 0 && (
                <ul className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(11rem,13.5rem))]">
                  {goals.map((task) => (
                    <QuestTaskRow key={task.label} task={task} stacked />
                  ))}
                </ul>
              )}
              {quest.quizAnswers && (
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
            </Block>
          )}

          {(quest.steps || quest.outro) && (
            <Block title="ขั้นตอน" color={color}>
              {quest.steps && (
                <ol className="space-y-2">
                  {quest.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${onBand}`}
                        style={{ backgroundColor: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-snug">
                        <CoordinateText text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {quest.outro && (
                <p className="flex items-center gap-2 font-bold">
                  <Flag aria-hidden className="h-4 w-4 shrink-0" style={{ color }} />
                  {quest.outro}
                </p>
              )}
            </Block>
          )}

          {quest.notes && (
            <ul className="space-y-2">
              {quest.notes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2 rounded-xl bg-(--anv-orange)/10 px-3 py-2 text-sm font-bold leading-snug"
                >
                  <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-(--anv-orange)" />
                  {note}
                </li>
              ))}
            </ul>
          )}

          {quest.rewards && <RewardBox compact title="รางวัลเมื่อเควสสำเร็จ" tasks={quest.rewards} />}
        </div>
      </div>
    </dialog>
  );
}
