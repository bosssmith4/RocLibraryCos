import { Gift, LockOpen } from "lucide-react";
import type { InfoPanel, QuestTask } from "@/types/anniversary";
import ChapterRef, { chapterNumberIn } from "./ChapterRef";
import QuestTaskRow from "./QuestTaskRow";

export const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * The rewards of a quest: a warm cream block with a ribbon, apart from the quest rows (which are
 * cool grey), each reward a slot with its count on the icon, like in the game.
 */
export function RewardBox({
  title,
  tasks,
}: {
  title: string;
  tasks: QuestTask[];
  /** kept so callers can ask for a wide layout; the slots always wrap by themselves */
  wide?: boolean;
  /** kept for callers that ask for the small look; every box now uses slots */
  compact?: boolean;
}) {
  return (
    <div className="space-y-2.5 rounded-2xl border-2 border-(--anv-cream) bg-(--anv-cream)/25 p-3">
      <p className="flex w-fit items-center gap-2 rounded-full bg-(--anv-ink) py-1 pl-3 pr-4 text-sm font-black text-(--anv-cream)">
        <Gift aria-hidden className="h-4 w-4" />
        {title}
      </p>
      <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
        {tasks.map((task) => {
          const unlocks = task.label.startsWith("ปลดล็อก") ? chapterNumberIn(task.label) : null;
          if (!unlocks) return <QuestTaskRow key={task.label} task={task} compact />;
          return (
            <li
              key={task.label}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-base-100 p-2 shadow-sm ring-1 ring-(--anv-cream) sm:col-span-full"
            >
              <span className="flex items-center gap-1.5 font-black">
                <LockOpen aria-hidden className="h-5 w-5 text-(--anv-ink)/60" />
                ปลดล็อก
              </span>
              <ChapterRef n={unlocks} />
              {task.via && <span className="text-sm text-base-content/70">{task.via}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A small box of facts: one line for each thing given, and label/value lines. */
export function Panel({ panel }: { panel: InfoPanel }) {
  return (
    <div className="space-y-2 rounded-2xl border-2 border-base-300 p-3">
      <p className="font-black">{panel.title}</p>
      {panel.chips && (
        <ul className="flex flex-wrap gap-2">
          {panel.chips.map((chip) => (
            <li key={chip} className="rounded-full bg-(--anv-cream)/40 px-3.5 py-1 text-sm font-bold">
              {chip}
            </li>
          ))}
        </ul>
      )}
      {panel.facts?.map((fact) => (
        <p key={fact.label} className="flex justify-between gap-3 text-sm">
          <span className="text-base-content/70">{fact.label}</span>
          <span className="font-bold">{fact.value}</span>
        </p>
      ))}
    </div>
  );
}
