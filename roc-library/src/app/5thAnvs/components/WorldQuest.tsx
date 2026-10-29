import { ArrowDown, ArrowRight, CalendarDays, Clock, Flag, Lock, Users, type LucideIcon } from "lucide-react";
import type { RecurringQuestGroup, QuestTask } from "@/types/anniversary";
import ChapterRef from "./ChapterRef";
import { Panel, RewardBox, fmt } from "./QuestParts";
import QuestTaskRow from "./QuestTaskRow";

/** The three things to know before anything else, in the order the data note gives them. */
const FACTS: { caption: string; Icon: LucideIcon }[] = [
  { caption: "รูปแบบ", Icon: Users },
  { caption: "ช่วงกิจกรรม", Icon: CalendarDays },
  { caption: "เงื่อนไขรับเควส", Icon: Lock },
];

function StepTitle({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--anv-ink) text-xl font-black text-(--anv-cream)"
      >
        {n}
      </span>
      <div className="min-w-0">
        <h4 className="text-xl font-black leading-tight">{title}</h4>
        <p className="text-sm text-base-content/70">{subtitle}</p>
      </div>
    </div>
  );
}

/** A small outlined numeral for a step inside a quest: a child, so it is not filled like its parent. */
function Dot({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-(--anv-ink)/40 text-xs font-black"
    >
      {n}
    </span>
  );
}

/** One column of the flow: what it is, then its rows. A goal says so, in its own tag. */
function FlowStep({ n, label, tasks, goal = false }: { n: number; label: string; tasks: QuestTask[]; goal?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-2 text-sm font-black">
        <Dot n={n} />
        {label}
        {goal && (
          <span className="inline-flex items-center gap-1 rounded-full bg-(--anv-ink) px-2.5 py-0.5 text-xs text-(--anv-cream)">
            <Flag aria-hidden className="h-3 w-3" />
            เป้าหมาย
          </span>
        )}
      </p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <QuestTaskRow key={task.label} task={task} largeMonster />
        ))}
      </ul>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden className="flex items-center justify-center text-base-content/40">
      <ArrowRight className="hidden h-8 w-8 md:block" />
      <ArrowDown className="h-8 w-8 md:hidden" />
    </div>
  );
}

/**
 * The World Quest as two steps. Step 1, Dragon Cataclysm: take the quest, hunt, get the
 * rewards. Step 2, World Event: hand the finished quests in and the whole server climbs a
 * ladder of goals. The requirements come first, once, instead of as separate bars.
 */
export default function WorldQuest({ group }: { group: RecurringQuestGroup }) {
  const [hunt, event] = group.quests;
  if (!hunt || !event) return null;

  const facts = (group.note ?? "").split(" · ").filter(Boolean);
  const nameOf = (title: string) => title.split(" · ").pop()?.replace(" (Special Quest)", "") ?? title;

  return (
    <div className="space-y-8">
      {facts.length === FACTS.length ? (
        <ul className="grid gap-3 md:grid-cols-3">
          {facts.map((fact, i) => {
            const { caption, Icon } = FACTS[i];
            return (
              <li key={caption} className="flex items-start gap-3 rounded-2xl bg-base-200 p-3">
                <Icon aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-base-content/60" />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-base-content/60">{caption}</p>
                  {i === 2 && group.requiresChapter ? (
                    <p className="flex flex-wrap items-center gap-2 font-bold leading-snug">
                      ต้องผ่าน <ChapterRef n={group.requiresChapter} /> ก่อนรับภารกิจ
                    </p>
                  ) : (
                    <p className="font-bold leading-snug">{fact}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        group.note && <p className="rounded-xl bg-(--anv-orange)/15 px-3 py-2 text-sm">{group.note}</p>
      )}

      <section aria-label={nameOf(hunt.title)} className="space-y-4">
        <StepTitle n="1" title={nameOf(hunt.title)} subtitle="เควสส่วนตัว · ทำสำเร็จแล้วนับให้ทั้งเซิร์ฟเวอร์ 1 ครั้ง" />
        <div className="space-y-3">
          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1.4fr]">
            <FlowStep n={1} label="รับเควส" tasks={hunt.tasks.filter((t) => t.kind === "find")} />
            <FlowArrow />
            <FlowStep n={2} label="สังหาร" goal tasks={hunt.tasks.filter((t) => t.kind === "kill")} />
          </div>
          <div aria-hidden className="flex justify-center text-base-content/40">
            <ArrowDown className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-black">
              <Dot n={3} />
              เมื่อสำเร็จ
            </p>
            <RewardBox title="รางวัลที่ได้รับ" tasks={hunt.tasks.filter((t) => t.kind === "reward")} />
          </div>
        </div>
        {hunt.notes && (
          <ul className="flex flex-wrap items-center gap-2">
            {hunt.notes.map((note) => (
              <li key={note} className="flex items-center gap-2 rounded-full bg-(--anv-cream)/40 px-3 py-1 text-sm font-bold">
                <Clock aria-hidden className="h-4 w-4 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={nameOf(event.title)} className="space-y-4 border-t-2 border-base-content/10 pt-8">
        <StepTitle n="2" title={nameOf(event.title)} subtitle="เควสทั้งเซิร์ฟเวอร์ · ทุกคนร่วมกันสะสมยอดเพื่อปลดรางวัล" />

        <div className="grid items-stretch gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-black">นำเควสที่ทำสำเร็จมาส่ง</p>
            <ul>
              {event.tasks.map((task) => (
                <QuestTaskRow key={task.label} task={task} largeMonster />
              ))}
            </ul>
          </div>
          {event.notes && (
            <div className="space-y-2 rounded-2xl bg-base-200 p-3">
              <p className="flex items-center gap-2 text-sm font-black">
                <Users aria-hidden className="h-4 w-4" />
                ยอดสะสมของทั้งเซิร์ฟเวอร์
              </p>
              <ul className="space-y-1 text-sm">
                {event.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {event.milestones && (
          <div className="space-y-2">
            <p className="flex flex-wrap items-center gap-2 text-sm font-black">
              <span className="inline-flex items-center gap-1 rounded-full bg-(--anv-ink) px-2.5 py-0.5 text-xs text-(--anv-cream)">
                <Flag aria-hidden className="h-3 w-3" />
                เป้าหมาย
              </span>
              ที่ต้องสะสมให้ถึง (จำนวนเควสที่ส่งสำเร็จ)
            </p>
            <ol className="relative grid gap-4 md:grid-cols-3">
              <span
                aria-hidden
                className="absolute left-4 right-4 top-4 hidden h-1.5 -translate-y-1/2 rounded-full bg-(--anv-ink)/20 md:block"
              />
              {event.milestones.map((m, i) => (
                <li key={m.target} className="relative pt-10">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-(--anv-ink) text-sm font-black text-(--anv-cream) ring-4 ring-base-100"
                  >
                    {i + 1}
                  </span>
                  <div className="space-y-2 rounded-2xl bg-base-200 p-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-base-content/60">สะสมครบ</p>
                      <p className="leading-none">
                        <span className="text-4xl font-black">{fmt(m.target)}</span>{" "}
                        <span className="font-bold">เควส</span>
                      </p>
                      <p className="mt-1 font-bold leading-snug">{m.name}</p>
                      <p className="text-xs uppercase tracking-wide text-base-content/60">{m.nameEn}</p>
                    </div>
                    <RewardBox title="รางวัลของทั้งเซิร์ฟเวอร์" tasks={[m.reward]} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {event.panels?.map((panel) => (
          <div key={panel.title} className="space-y-2">
            <p className="text-sm font-black">รางวัลขั้นที่ 1 · ได้รับบัฟอะไรบ้าง</p>
            <Panel panel={panel} />
          </div>
        ))}
      </section>
    </div>
  );
}
