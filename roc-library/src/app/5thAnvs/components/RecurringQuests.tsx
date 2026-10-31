import { RECURRING_QUESTS } from "@/data/anniversary5thQuests";
import type { RecurringQuestGroup } from "@/types/anniversary";
import ChapterRef from "./ChapterRef";
import { CoordinateText } from "./CoordinateLink";
import { RewardBox } from "./QuestParts";
import QuestTaskRow from "./QuestTaskRow";
import SectionHeading from "./SectionHeading";
import SourceRef from "./SourceRef";
import WorldQuest from "./WorldQuest";

const ART = "/assets/images/anvs/landing";

/** Band colour and picture of each group. */
const GROUP_STYLES = {
  daily: { band: "bg-(--anv-orange) text-(--anv-ink)", art: "sun.svg" },
  weekly: { band: "bg-(--anv-cream) text-(--anv-ink)", art: "calendar.svg" },
  world: { band: "bg-(--anv-ink) text-(--anv-cream)", art: "globe.svg" },
} as const;

function GroupCard({ group }: { group: RecurringQuestGroup }) {
  const style = GROUP_STYLES[group.id];
  return (
    <div id={`quest-${group.id}`} className="scroll-mt-40 overflow-hidden rounded-3xl bg-base-100 shadow-lg">
      <div className={`relative flex items-center justify-between px-5 py-4 ${style.band}`}>
        <h3 className="text-xl font-black">{group.title}</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ART}/${style.art}`} alt="" aria-hidden className="h-14 w-14 -rotate-12 drop-shadow" />
      </div>
      <div className="space-y-3 p-5">
        {group.id === "world" ? (
          <WorldQuest group={group} />
        ) : (
          <>
            {group.requiresChapter && (
              <p className="flex flex-wrap items-center gap-2 text-sm font-black">
                ต้องผ่านเควส
                <ChapterRef n={group.requiresChapter} />
                ก่อนรับภารกิจ
              </p>
            )}
            {group.acceptAt && (
              <p className="flex flex-wrap items-center gap-2 text-sm font-black">
                รับเควสที่ NPC
                <span className="rounded-full bg-base-200 px-3 py-1 font-bold">
                  Invaded Prontera · <CoordinateText text={group.acceptAt} />
                </span>
              </p>
            )}
            {group.note && <p className="rounded-xl bg-base-200 px-3 py-2 text-sm">{group.note}</p>}
            {group.quests.length === 0 ? (
              <p className="text-sm text-base-content/70">กำลังรวบรวมข้อมูล</p>
            ) : (
              group.quests.map((quest) => (
                <div key={quest.title} className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-widest text-(--anv-orange)">{quest.title}</p>
                  <ul className="space-y-2">
                    {quest.tasks
                      .filter((task) => task.kind !== "reward")
                      .map((task) => (
                        <QuestTaskRow key={task.label} task={task} />
                      ))}
                  </ul>
                  {quest.tasks.some((task) => task.kind === "reward") && (
                    <RewardBox
                      title="รางวัลที่ได้รับเมื่อทำเควสสำเร็จ"
                      tasks={quest.tasks.filter((task) => task.kind === "reward")}
                    />
                  )}
                  {quest.notes?.map((note) => (
                    <p key={note} className="rounded-xl bg-(--anv-orange)/15 px-3 py-2 text-sm">
                      {note}
                    </p>
                  ))}
                </div>
              ))
            )}
            {group.rewards && (
              <RewardBox
                compact
                title={`ของรางวัล${group.rewardNote ? ` · ${group.rewardNote}` : ""}`}
                tasks={group.rewards}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Daily and Weekly quests side by side; the World Quest on its own row below. */
export default function RecurringQuests({ index }: { index: string }) {
  const regular = RECURRING_QUESTS.filter((g) => g.id !== "world");
  const world = RECURRING_QUESTS.find((g) => g.id === "world");
  return (
    <section aria-labelledby="recurring-title" className="space-y-5">
      <SectionHeading index={index} title="Quest · Daily / Weekly / World" id="recurring-title" />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {regular.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
      {world && <GroupCard group={world} />}
      <SourceRef
        href="https://roc.gnjoy.in.th/event/all-server-5th-anniversary-daily-weekly-quest/"
        title="5th Anniversary Daily / Weekly Quest"
      />
    </section>
  );
}
