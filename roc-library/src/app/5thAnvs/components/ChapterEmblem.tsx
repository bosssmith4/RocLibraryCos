import type { ReactNode } from "react";

/** Simple drawings centred on 0,0 (about 100 wide): one emblem per town. */
const GLYPHS: Record<string, ReactNode> = {
  Izlude: (
    <path d="M-46 24C-40-8-18-34 14-40L40-44C34-34 28-26 20-20 34-22 44-24 50-26 42-12 30-4 18 0 30 0 38-2 44-4 36 10 22 18 6 20-8 22-26 26-46 24Z" />
  ),
  Payon: (
    <>
      <path d="M0-44L34 6H-34Z" />
      <path d="M0-20L40 30H-40Z" />
      <rect x="-7" y="28" width="14" height="18" />
    </>
  ),
  Alberta: (
    <g fill="none">
      <circle cx="0" cy="-32" r="9" />
      <path d="M0-23V38M-18-8H18M-36 14C-32 36-10 42 0 38 10 42 32 36 36 14" />
    </g>
  ),
  Geffen: (
    <path d="M-18 44V-14H-24V-34H-12V-26H-4V-34H4V-26H12V-34H24V-14H18V44Z" />
  ),
  Morroc: (
    <>
      <path d="M-46 40L0-22 46 40Z" />
      <circle cx="26" cy="-30" r="12" />
    </>
  ),
  Prontera: <path d="M-42 34L-36-20-16 6 0-34 16 6 36-20 42 34Z" />,
};

/** A town's emblem in cream with an ink outline, or a "?" when its Chapter is not revealed. */
export default function ChapterEmblem({
  town,
  mystery,
  art,
  x,
  y,
}: {
  town: string;
  mystery: boolean;
  /** a picture of the key reward; drawn instead of the emblem or the "?" */
  art?: string;
  x: number;
  y: number;
}) {
  if (art) {
    return <image href={art} x={x - 52} y={y - 56} width={104} height={104} preserveAspectRatio="xMidYMid meet" />;
  }
  if (mystery) {
    return (
      <text
        x={x}
        y={y + 28}
        textAnchor="middle"
        fontSize={96}
        fontWeight={900}
        fill="#fff6e5"
        stroke="var(--anv-ink)"
        strokeWidth={8}
        paintOrder="stroke"
      >
        ?
      </text>
    );
  }
  const glyph = GLYPHS[town];
  if (!glyph) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(0.95)`} strokeLinejoin="round" strokeLinecap="round">
      <g fill="var(--anv-ink)" stroke="var(--anv-ink)" strokeWidth={11}>
        {glyph}
      </g>
      <g fill="#fff6e5" stroke="#fff6e5" strokeWidth={4}>
        {glyph}
      </g>
    </g>
  );
}
