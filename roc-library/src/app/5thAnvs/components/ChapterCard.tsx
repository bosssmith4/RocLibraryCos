import type { AnniversaryInfoEntry } from "@/types/anniversary";

const ART = "/assets/images/anvs/landing";

/** One Chapter: its picture (or the "?" box), names, passage and closing line. */
export default function ChapterCard({
  entry,
  kind,
  className = "",
}: {
  entry: AnniversaryInfoEntry;
  /** what kind of quest the Chapter has, e.g. "สังหาร" */
  kind?: string;
  className?: string;
}) {
  return (
    <article className={`flex gap-4 rounded-3xl bg-base-100 p-5 shadow-xl ${className}`}>
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-(--anv-orange) to-(--anv-cream)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.art?.src ?? `${ART}/${entry.mystery ? "mystery" : "castle"}.svg`}
          alt={entry.art?.alt ?? (entry.mystery ? "ยังไม่เปิดเผย" : "")}
          className="h-14 w-14 object-contain drop-shadow"
        />
      </span>
      <div className="min-w-0 space-y-1.5">
        <h3 className="text-base font-black tracking-wide text-(--anv-orange)">
          {entry.title}
        </h3>
        {entry.subtitle && (
          <p className="text-xs font-bold uppercase tracking-wide text-base-content/70">
            Chapter {entry.numeral} · {entry.subtitle}
          </p>
        )}
        {entry.heading && (
          <p className="text-lg font-black leading-snug">“{entry.heading}”</p>
        )}
        {entry.detail?.map((line) => (
          <p key={line} className="text-sm text-base-content/80">
            {line}
          </p>
        ))}
        {entry.tagline && <p className="text-sm font-bold italic">‘{entry.tagline}’</p>}
        {kind && (
          <p className="pt-1">
            <span className="rounded-full bg-(--anv-ink) px-3 py-1 text-xs font-black text-(--anv-cream)">
              ภารกิจ: {kind}
            </span>
            <span className="ml-2 text-xs text-base-content/70">คลิกเพื่อดูรายละเอียด</span>
          </p>
        )}
      </div>
    </article>
  );
}
