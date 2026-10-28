"use client";
import { useState } from "react";
import { ANNIVERSARY_INFO_SECTIONS } from "@/data/anniversary5thInfo";
import { CHAPTER_QUESTS } from "@/data/anniversary5thQuests";
import ChapterCard from "./ChapterCard";
import ChapterEmblem from "./ChapterEmblem";
import ChapterPopup from "./ChapterPopup";
import QuestModal from "./QuestModal";
import { MAP_HEIGHT, MAP_WIDTH, REGION_COLORS, buildRegions, type Region } from "./chapterMapLayout";

const entries = ANNIVERSARY_INFO_SECTIONS.find((s) => s.id === "chapters")?.entries ?? [];
const regions = buildRegions();
const questOf = (town: string) => CHAPTER_QUESTS.find((q) => q.town === town);

/**
 * The page's start: one continent split into six regions that share their borders.
 * Pointing at a region lifts it and opens its Chapter. Tapping or focusing does the
 * same, so it works without a mouse.
 */
export default function ChapterMap() {
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  /** the Chapter whose quest window is open */
  const [selected, setSelected] = useState<number | null>(null);
  const activeEntry = active === null ? undefined : entries[active];
  const selectedEntry = selected === null ? undefined : entries[selected];
  const selectedQuest = selectedEntry ? questOf(selectedEntry.title) : undefined;

  const clear = () => {
    setActive(null);
    setPinned(false);
  };

  return (
    <section aria-label="แผนที่ Chapter" className="space-y-4">
      <div
        className="anvs-sea relative overflow-hidden rounded-3xl border-4 border-(--anv-ink) shadow-xl"
        onClick={clear}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="relative block h-auto w-full"
          role="group"
          aria-label="แผนที่ 6 เมือง เลื่อนเมาส์หรือแตะเมืองเพื่อดู Chapter"
        >
          <defs>
            <pattern id="anvs-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="2.2" fill="#fff" fillOpacity="0.22" />
            </pattern>
            <pattern id="anvs-sealed" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#000" strokeOpacity="0.22" strokeWidth="7" />
            </pattern>
          </defs>
          <SeaDetails />
          {regions.map((region) => {
            const entry = entries[region.index];
            if (!entry) return null;
            return (
              <RegionShape
                key={entry.title}
                region={region}
                color={REGION_COLORS[region.index % REGION_COLORS.length]}
                selected={selected === region.index}
                town={entry.title}
                numeral={entry.numeral ?? String(region.index + 1)}
                mystery={!!entry.mystery}
                art={entry.art?.src}
                active={active === region.index}
                delay={region.index * 0.08}
                onEnter={() => {
                  setActive(region.index);
                  setPinned(false);
                }}
                onLeave={() => {
                  if (!pinned) setActive(null);
                }}
                onSelect={() => {
                  setActive(region.index);
                  setPinned(true);
                  setSelected(region.index);
                }}
              />
            );
          })}
        </svg>

        {/* From lg up the Chapter pops up on its own region; below lg it shows under the map. */}
        {regions.map((region) => {
          const entry = entries[region.index];
          if (!entry || active !== region.index) return null;
          return (
            <div
              key={entry.title}
              className="anvs-card-pop pointer-events-none absolute z-10 hidden w-[27%] min-w-56 -translate-x-1/2 -translate-y-1/2 lg:block"
              style={{
                left: `${(region.cx / MAP_WIDTH) * 100}%`,
                top: `calc(${(region.cy / MAP_HEIGHT) * 100}% - 12px)`,
              }}
            >
              <ChapterPopup
                entry={entry}
                kind={questOf(entry.title)?.kind}
                color={REGION_COLORS[region.index % REGION_COLORS.length]}
              />
            </div>
          );
        })}
      </div>

      <div className="lg:hidden" aria-live="polite">
        {activeEntry ? (
          <ChapterCard entry={activeEntry} kind={questOf(activeEntry.title)?.kind} />
        ) : (
          <p className="rounded-box bg-base-100 p-4 text-center text-base-content/70">
            แตะที่เมืองบนแผนที่เพื่อดู Chapter
          </p>
        )}
      </div>

      {selectedEntry && selectedQuest && selected !== null && (
        <QuestModal
          key={selectedEntry.title}
          quest={selectedQuest}
          entry={selectedEntry}
          color={REGION_COLORS[selected % REGION_COLORS.length]}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

interface RegionShapeProps {
  region: Region;
  color: string;
  /** its quest window is open */
  selected: boolean;
  town: string;
  numeral: string;
  mystery: boolean;
  /** picture of the Chapter's key reward, drawn in place of the emblem */
  art?: string;
  active: boolean;
  delay: number;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

function RegionShape({
  region,
  color,
  selected,
  town,
  numeral,
  mystery,
  art,
  active,
  delay,
  onEnter,
  onLeave,
  onSelect,
}: RegionShapeProps) {
  const { cx, cy, d } = region;
  return (
    <g
      className="anvs-land anvs-pop"
      data-active={active || selected}
      style={{ animationDelay: `${delay}s` }}
      role="button"
      tabIndex={0}
      aria-label={`Chapter ${numeral} ${town}${mystery ? " (ยังไม่เปิดเผย)" : ""}`}
      aria-pressed={selected}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <path className="shadow" d={d} fill="#000" opacity={0.3} transform="translate(0 14)" />
      <g className="top">
        <path
          className="rim"
          d={d}
          fill={color}
          stroke="var(--anv-ink)"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <path d={d} fill="url(#anvs-dots)" />
        {mystery && <path d={d} fill="url(#anvs-sealed)" />}
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.4}
          strokeWidth={3}
          transform={`translate(${cx} ${cy}) scale(0.92) translate(${-cx} ${-cy})`}
        />
        <g className="label">
        <circle cx={cx} cy={cy - 92} r={22} fill="#fff6e5" stroke="var(--anv-ink)" strokeWidth={5} />
        <text
          x={cx}
          y={cy - 83}
          textAnchor="middle"
          fontSize={numeral.length > 2 ? 17 : 22}
          fontWeight={900}
          fill="var(--anv-ink)"
        >
          {numeral}
        </text>
        <ChapterEmblem town={town} mystery={mystery} art={art} x={cx} y={cy - 18} />
        <g className="hidden sm:inline">
          {active && (
            // the name turns into a cream tag with the region's own colour, darkened, so it stands out
            <rect
              x={cx - (town.length * 19 + 44) / 2}
              y={cy + 36}
              width={town.length * 19 + 44}
              height={46}
              rx={23}
              fill="#fff6e5"
              stroke="var(--anv-ink)"
              strokeWidth={5}
            />
          )}
          <text
            x={cx}
            y={cy + 70}
            textAnchor="middle"
            fontSize={36}
            fontWeight={900}
            letterSpacing={1}
            fill={active ? `color-mix(in srgb, ${color} 55%, black)` : "#fff"}
            stroke={active ? "none" : "var(--anv-ink)"}
            strokeWidth={7}
            paintOrder="stroke"
          >
            {town}
          </text>
        </g>
        {/* On a phone the full name will not fit, so only its first three letters show: "Izl", "Pay"... */}
        <text
          className="sm:hidden"
          x={cx}
          y={cy + 62}
          textAnchor="middle"
          fontSize={46}
          fontWeight={900}
          fill="#fff"
          stroke="var(--anv-ink)"
          strokeWidth={10}
          paintOrder="stroke"
        >
          {town.slice(0, 3)}
        </text>
        </g>
      </g>
    </g>
  );
}

/** Waves, a compass and a hint in the sea around the land. Decoration only. */
function SeaDetails() {
  const waves: [number, number][] = [
    [34, 26], [236, 14], [470, 30], [700, 18], [900, 34],
    [24, 330], [952, 340], [28, 640], [330, 656], [610, 660],
  ];
  return (
    <g aria-hidden pointerEvents="none">
      {waves.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d="M0 0q8-8 16 0t16 0t16 0"
          transform={`translate(${x} ${y})`}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.25}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      <g transform="translate(930 652)" fill="#f0d29c" fillOpacity={0.85}>
        <circle r={32} fill="none" stroke="#f0d29c" strokeOpacity={0.6} strokeWidth={3} />
        <polygon points="0,-28 6,0 0,28 -6,0" />
        <polygon points="28,0 0,6 -28,0 0,-6" fillOpacity={0.55} />
        <text y={-38} textAnchor="middle" fontSize={16} fontWeight={800}>N</text>
      </g>
      <text
        className="hidden sm:inline"
        x={MAP_WIDTH / 2}
        y={MAP_HEIGHT - 20}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill="#f0d29c"
        fillOpacity={0.9}
      >
        ชี้หรือแตะที่เมืองเพื่อดู Chapter
      </text>
    </g>
  );
}
