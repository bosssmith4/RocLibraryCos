"use client";

import { CHAPTER_QUESTS } from "@/data/anniversary5thQuests";
import { ANNIVERSARY_INFO_SECTIONS } from "@/data/anniversary5thInfo";
import type { ChapterQuest } from "@/types/anniversary";
import { REGION_COLORS } from "./chapterMapLayout";
import RequirementText from "./RequirementText";

const chapters = ANNIVERSARY_INFO_SECTIONS.find((s) => s.id === "chapters")?.entries ?? [];

/** The picture that stands for a Chapter: its first monster, else its first item. */
function pictureOf(quest: ChapterQuest): string | null {
  const withMonster = quest.tasks.find((t) => t.monsterId !== undefined);
  if (withMonster) return `/assets/images/monsterDb/${withMonster.monsterId}.gif`;
  const withItem = quest.tasks.find((t) => t.itemImageId !== undefined);
  if (withItem) return `/assets/images/anvs/items/${withItem.itemImageId}.bmp`;
  return null;
}

/** True when white text would be hard to read on this #rrggbb colour. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
}

/**
 * The legend of the map: the six Chapters as one ledger of cells that share their edges, in the
 * map colours. Each cell says who may start it (the gate) and what it gives.
 */
export default function JourneyStrip() {
  return (
    <ol
      aria-label="สรุป 6 Chapter"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border-2 border-(--anv-ink) bg-(--anv-ink) sm:grid-cols-3 lg:grid-cols-6"
    >
      {CHAPTER_QUESTS.map((quest, i) => {
        const entry = chapters.find((c) => c.title === quest.town);
        const color = REGION_COLORS[i % REGION_COLORS.length];
        const picture = pictureOf(quest);
        // everything the Chapter gives except the World Fruit all of them give, and the unlock of the next one
        const prizes = (quest.rewards ?? []).filter(
          (r) => r.label !== "World Fruit" && !r.label.startsWith("ปลดล็อก"),
        );
        return (
          <li key={quest.town} className="flex flex-col bg-base-100">
            <span
              className={`flex items-center gap-2 px-3 py-2 font-black ${isLight(color) ? "text-(--anv-ink)" : "text-white"}`}
              style={{ backgroundColor: color }}
            >
              <span className="text-lg leading-none">{entry?.numeral ?? i + 1}</span>
              <span className="truncate">{quest.town}</span>
            </span>
            <span className="flex flex-1 flex-col gap-1.5 p-3">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-base-content/70">{quest.kind}</span>
                {picture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={picture}
                    alt=""
                    aria-hidden
                    className="h-10 w-10 shrink-0 object-contain"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                )}
              </span>
              {quest.requirements?.[0] && (
                <span className="text-sm leading-snug">
                  <span className="font-black">ต้อง </span>
                  <RequirementText text={quest.requirements[0]} />
                </span>
              )}
              {prizes.length > 0 && (
                <ul className="mt-auto space-y-0.5 pt-1 text-sm font-black leading-snug text-(--anv-orange)">
                  {prizes.map((p) => (
                    <li key={p.label}>ได้ {p.label}</li>
                  ))}
                </ul>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
