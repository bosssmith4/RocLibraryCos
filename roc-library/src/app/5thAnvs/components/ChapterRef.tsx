import { ANNIVERSARY_INFO_SECTIONS } from "@/data/anniversary5thInfo";
import { REGION_COLORS } from "./chapterMapLayout";

const chapters = ANNIVERSARY_INFO_SECTIONS.find((s) => s.id === "chapters")?.entries ?? [];

const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

/** True when white text would be hard to read on this #rrggbb colour. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
}

/** The Roman numeral ("I".."VI") of a Chapter as written in a text, or null. */
export function chapterNumberIn(text: string): number | null {
  const m = text.match(/Chapter\s+(VI|IV|V|III|II|I)\b/);
  return m ? NUMERALS.indexOf(m[1]) + 1 : null;
}

/**
 * A Chapter named in the text, shown as the Chapter itself: its logo on a white disc and its
 * name, on the colour the map gives it. `n` counts from 1.
 */
export default function ChapterRef({ n, showTown = true }: { n: number; showTown?: boolean }) {
  const i = n - 1;
  const entry = chapters[i];
  if (!entry) return null;
  const color = REGION_COLORS[i % REGION_COLORS.length];
  const logo = entry.logo ?? entry.art;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-3 align-middle font-black ${
        isLight(color) ? "text-(--anv-ink)" : "text-white"
      }`}
      style={{ backgroundColor: color }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-100">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.src} alt="" aria-hidden className="h-6 w-6 object-contain" />
        ) : (
          <span className="text-xs text-(--anv-ink)">{NUMERALS[i]}</span>
        )}
      </span>
      <span className="whitespace-nowrap">Chapter {NUMERALS[i]}</span>
      {showTown && <span className="whitespace-nowrap text-sm font-bold opacity-90">· {entry.title}</span>}
    </span>
  );
}
