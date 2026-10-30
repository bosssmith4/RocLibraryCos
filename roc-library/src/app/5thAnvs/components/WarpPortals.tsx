"use client";
import { useState } from "react";
import { Coins, Gift } from "lucide-react";
import {
  MIDGARD_CROP as CROP,
  MIDGARD_WIDTH as W,
  WARP_FEES,
  WARP_TOWNS,
  type WarpTown,
} from "@/data/anniversary5thWarp";
import { coordinateText, type MapCoordinate } from "@/utils/mapCoordinate";
import { REGION_COLORS } from "./chapterMapLayout";
import MapLocationModal from "./MapLocationModal";
import SectionHeading from "./SectionHeading";

/** The official page the Warp rules and the town coordinates come from. */
const SOURCE = "https://roc.gnjoy.in.th/event/the-rise-of-awake-novice/";

/** Width and height, in the picture's pixels, of the piece cut out around a town. */
const PIECE = 112;
/** a different hand-drawn outline for each town, so the pieces do not look stamped */
const BLOBS = [
  "58% 42% 55% 45% / 48% 56% 44% 52%",
  "46% 54% 42% 58% / 56% 44% 56% 44%",
  "52% 48% 60% 40% / 44% 58% 42% 56%",
  "42% 58% 48% 52% / 54% 42% 58% 46%",
  "56% 44% 44% 56% / 46% 52% 48% 54%",
  "48% 52% 56% 44% / 58% 46% 54% 42%",
];

const spot = (t: WarpTown): MapCoordinate => ({ map: t.map, x: t.x, y: t.y });

/** One town: a piece of the continent picture that lifts on hover or focus and opens the town's map. */
function TownPiece({ town, index, onOpen }: { town: WarpTown; index: number; onOpen: () => void }) {
  const left = town.at.x - PIECE / 2;
  const top = town.at.y - PIECE / 2;
  const color = REGION_COLORS[(town.chapter - 1) % REGION_COLORS.length];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${town.name} ${coordinateText(spot(town))} เปิดแมพ`}
      className="group absolute z-10 cursor-pointer focus-visible:outline-none hover:z-20 focus-visible:z-20"
      style={{
        left: `${((left - CROP.x) / CROP.width) * 100}%`,
        top: `${((top - CROP.y) / CROP.height) * 100}%`,
        width: `${(PIECE / CROP.width) * 100}%`,
        aspectRatio: "1",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden border-4 bg-base-300 shadow-md transition-all duration-200 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-2xl group-focus-visible:-translate-y-2 group-focus-visible:scale-110 group-focus-visible:shadow-2xl group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-(--anv-orange) motion-reduce:transition-none"
        style={{ borderColor: color, borderRadius: BLOBS[index % BLOBS.length] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/anvs/warp/midgard.jpg"
          alt=""
          draggable={false}
          className="absolute max-w-none select-none"
          style={{
            width: `${(W / PIECE) * 100}%`,
            left: `${(-left / PIECE) * 100}%`,
            top: `${(-top / PIECE) * 100}%`,
          }}
        />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-black text-white shadow transition-transform group-hover:-translate-y-2 group-focus-visible:-translate-y-2 motion-reduce:transition-none"
        style={{ backgroundColor: color }}
      >
        {town.name}
      </span>
    </button>
  );
}

/**
 * Section 06: where the Warp Portal NPC stands in each main town, and who pays what to use it. The
 * continent picture lets a player pick a town; pressing one opens that town's map with a pin on the NPC.
 */
export default function WarpPortals({ index }: { index: string }) {
  const [open, setOpen] = useState<MapCoordinate | null>(null);

  return (
    <section aria-labelledby="warp-title" className="space-y-6">
      <SectionHeading index={index} title="จุดวาร์ปตามเมือง" id="warp-title" />
      <p className="text-base-content/80">
        ผู้เล่นเข้าแผนที่ของกิจกรรมได้ผ่าน NPC Warp Portal ที่อยู่ประจำเมืองหลัก 6 เมือง
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {WARP_FEES.map((f) => (
          <div
            key={f.id}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 ${
              f.free ? "border-(--anv-orange) bg-(--anv-cream)/30" : "border-base-300 bg-base-100"
            }`}
          >
            {f.free ? (
              <Gift aria-hidden className="h-8 w-8 shrink-0 text-(--anv-orange)" />
            ) : (
              <Coins aria-hidden className="h-8 w-8 shrink-0" />
            )}
            <p className="leading-tight">
              <span className="block text-sm font-bold text-base-content/70">{f.who}</span>
              <span className="block text-xl font-black">{f.fee}</span>
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-base-content/70">เลือกเมืองบนแผนที่ เพื่อดูตำแหน่ง Warp Portal</p>
      <div
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-(--anv-ink) bg-base-300"
        style={{ aspectRatio: `${CROP.width} / ${CROP.height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/anvs/warp/midgard.jpg"
          alt="แผนที่ทวีป Midgard"
          draggable={false}
          className="absolute max-w-none select-none brightness-[0.7] saturate-50"
          style={{
            width: `${(W / CROP.width) * 100}%`,
            left: `${(-CROP.x / CROP.width) * 100}%`,
            top: `${(-CROP.y / CROP.height) * 100}%`,
          }}
        />
        {WARP_TOWNS.map((t, i) => (
          <TownPiece key={t.map} town={t} index={i} onOpen={() => setOpen(spot(t))} />
        ))}
      </div>

      <p className="text-sm text-base-content/70">
        ที่มา:{" "}
        <a href={SOURCE} target="_blank" rel="noreferrer" className="underline">
          roc.gnjoy.in.th · The Rise of Awake Novice
        </a>
      </p>

      {open && <MapLocationModal coordinates={[open]} onClose={() => setOpen(null)} />}
    </section>
  );
}
