"use client";

import { CHAPTER_QUESTS } from "@/data/anniversary5thQuests";
import { ANNIVERSARY_INFO_SECTIONS } from "@/data/anniversary5thInfo";
import type { ChapterQuest } from "@/types/anniversary";
import { REGION_COLORS } from "./chapterMapLayout";

const chapters = ANNIVERSARY_INFO_SECTIONS.find((s) => s.id === "chapters")?.entries ?? [];

/** The picture that stands for a Chapter: its first monster, else its first item. */
function pictureOf(quest: ChapterQuest): string | null {
  const withMonster = quest.tasks.find((t) => t.monsterId !== undefined);
  if (withMonster) return `/assets/images/monsterDb/${withMonster.monsterId}.gif`;
  const withItem = quest.tasks.find((t) => t.itemImageId !== undefined);
  if (withItem) return `/assets/images/anvs/items/${withItem.itemImageId}.bmp`;
  return null;
}

/**
 * The whole Story Quest in one glance: six stops in order, each with who may start it
 * (the gate), what to do and what it gives. Wide screens read it as a row, phones as a column.
 */
export default function JourneyStrip() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CHAPTER_QUESTS.map((quest, i) => {
        const entry = chapters.find((c) => c.title === quest.town);
        const color = REGION_COLORS[i % REGION_COLORS.length];
        const picture = pictureOf(quest);
        const prize = quest.rewards?.find((r) => r.label !== "World Fruit");
        return (
          <li
            key={quest.town}
            className="relative flex gap-3 overflow-hidden rounded-2xl border-2 bg-base-100 p-3 shadow"
            style={{ borderColor: color }}
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ backgroundColor: color }}
            >
              {entry?.numeral ?? i + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-black leading-tight">
                {quest.town} <span className="text-sm font-bold text-base-content/70">· {quest.kind}</span>
              </p>
              {quest.requirements?.[0] && (
                <p className="text-sm font-bold text-base-content/70">ต้อง: {quest.requirements[0]}</p>
              )}
              {prize && (
                <p className="rounded-lg bg-(--anv-orange)/15 px-2 py-1 text-sm font-bold leading-snug">
                  ได้: {prize.label}
                </p>
              )}
            </div>
            {picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={picture}
                alt=""
                aria-hidden
                className="h-14 w-14 shrink-0 self-center object-contain"
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
