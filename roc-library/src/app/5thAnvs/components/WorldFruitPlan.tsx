import { Flag } from "lucide-react";
import { WORLD_FRUIT_PER_TICKET, WORLD_FRUIT_PLAN } from "@/data/anniversary5thGuide";
import ChapterRef from "./ChapterRef";
import ExchangeTag from "./ExchangeTag";
import TradeTag from "./TradeTag";
import { CutoutPicture } from "./QuestTaskRow";
import SectionHeading from "./SectionHeading";
import WorldFruitInfo from "./WorldFruitInfo";

const GOAL = WORLD_FRUIT_PER_TICKET;
const fmt = (n: number) => n.toLocaleString("en-US");
/** whole days to earn `need` at `perWeek` a week, rounded up; integers, so 14 stays 14 */
const days = (need: number, perWeek: number) => Math.ceil((need * 7) / perWeek);

type Source = (typeof WORLD_FRUIT_PLAN.repeating)[number];
const perWeek = (s: Source) => s.claimsPerWeek * s.perClaim;
/** what the player controls: every source that does not depend on the whole server */
const own = WORLD_FRUIT_PLAN.repeating.filter((s) => !s.conditional);
const ownPerWeek = own.reduce((sum, s) => sum + perWeek(s), 0);
const eventPerWeek = WORLD_FRUIT_PLAN.repeating
  .filter((s) => s.conditional)
  .reduce((sum, s) => sum + perWeek(s), 0);
const widest = Math.max(...WORLD_FRUIT_PLAN.repeating.map(perWeek));

const SCENARIOS = [
  { id: "marin", title: "มี Marin Transform Item", chapters: WORLD_FRUIT_PLAN.chapters.withMarin },
  { id: "plain", title: "ไม่มี Marin Transform Item", chapters: WORLD_FRUIT_PLAN.chapters.withoutMarin },
].map((s) => {
  const main = s.chapters * WORLD_FRUIT_PLAN.perChapter;
  return { ...s, main, rest: GOAL - main };
});

/** One bar from 0 to the goal, labelled on both parts: the Main Quest's share and what is left to earn. */
function GoalBar({ main, rest }: { main: number; rest: number }) {
  return (
    <div
      role="img"
      aria-label={`Main Quest ${fmt(main)} จาก ${fmt(GOAL)} เหลืออีก ${fmt(rest)}`}
      className="flex h-16 overflow-hidden rounded-xl border-2 border-(--anv-ink) text-center leading-tight"
    >
      <div
        className="flex flex-col items-center justify-center bg-(--anv-ink) text-(--anv-cream)"
        style={{ width: `${(main / GOAL) * 100}%` }}
      >
        <span className="text-xs font-bold">① Main Quest</span>
        <span className="text-xl font-black">{fmt(main)}</span>
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center bg-(--anv-cream)/40"
        style={{ width: `${(rest / GOAL) * 100}%` }}
      >
        <span className="text-xs font-bold">② เควสทำซ้ำ</span>
        <span className="text-xl font-black">+{fmt(rest)}</span>
      </div>
    </div>
  );
}

/** The item a source pays in, with its count on the corner; the same look as the reward slots above. */
function Slot({ itemId, count }: { itemId: string | number; count: number }) {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-(--anv-cream)/40">
      <CutoutPicture
        src={`/assets/images/anvs/items/${itemId}.bmp`}
        className="h-12 w-12 object-contain"
        fallback={null}
      />
      <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-(--anv-ink) px-1.5 py-0.5 text-xs font-black leading-none text-(--anv-cream)">
        ×{count}
      </span>
    </span>
  );
}

/**
 * Section 05: the way to 1,200 World Fruit, one Gacha Ticket. Read it top to bottom: the goal, the
 * two ways to start (with or without a Marin Transform Item) and how many days each takes, then
 * what each repeating quest pays in a week.
 */
export default function WorldFruitPlan({ index }: { index: string }) {
  return (
    <section aria-labelledby="fruit-plan-title" className="space-y-6">
      <SectionHeading index={index} title="สะสม World Fruit ให้ครบ 1,200" id="fruit-plan-title" />

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-(--anv-cream)/30 p-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-base-100 shadow">
          <CutoutPicture src="/assets/images/anvs/items/6435.bmp" className="h-12 w-12 object-contain" fallback={null} />
        </span>
        <p className="min-w-0 flex-1 leading-tight">
          <span className="block text-4xl font-black">{fmt(GOAL)}</span>
          <span className="block font-bold">World Fruit = [NFS] Gacha Ticket 1 ใบ</span>
          <span className="block text-sm text-base-content/70">
            ใช้แลกของรางวัลฉลองครบรอบ พร้อม 1,000,000 Zeny ต่อครั้ง
          </span>
        </p>
        <WorldFruitInfo variant="chip" />
      </div>

      <div className="space-y-3">
        <h3 className="border-b-2 border-(--anv-ink) pb-1 text-lg font-black">เริ่มจากอะไร ใช้กี่วันถึง {fmt(GOAL)}</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {SCENARIOS.map((s) => (
            <div key={s.id} className="space-y-3 rounded-2xl border-2 border-base-300 bg-base-100 p-4">
              <h4 className="flex items-center gap-2 text-lg font-black">
                <Flag aria-hidden className="h-5 w-5" />
                {s.title}
              </h4>
              <GoalBar main={s.main} rest={s.rest} />
              <p className="text-sm text-base-content/70">
                ① ทำ Main Quest ครบ {s.chapters} Chapter · Chapter ละ {WORLD_FRUIT_PLAN.perChapter}
                {s.id === "plain" && " (ข้าม Chapter VI เพราะต้องมี Marin Transform Item)"}
              </p>
              <div className="flex items-center gap-4 rounded-xl bg-base-200 p-3">
                <p className="shrink-0 leading-none">
                  <span className="text-4xl font-black">≈{days(s.rest, ownPerWeek)}</span>
                  <span className="ml-1 font-bold">วัน</span>
                </p>
                <p className="min-w-0 text-sm leading-snug">
                  <span className="font-bold">② ทำ Daily + Weekly + Dragon ให้ได้อีก {fmt(s.rest)}</span>
                  <span className="block text-base-content/70">
                    ถ้ามี World Event ด้วย ≈ {days(s.rest, ownPerWeek + eventPerWeek)} วัน
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="border-b-2 border-(--anv-ink) pb-1 text-lg font-black">เควสทำซ้ำ ได้ World Fruit สัปดาห์ละเท่าไร</h3>
        <ul className="divide-y divide-base-300">
          {WORLD_FRUIT_PLAN.repeating.map((s) => (
            <li
              key={s.id}
              className="grid items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
            >
              <div className="flex items-center gap-3">
                <Slot itemId={s.itemImageId} count={s.perClaim} />
                <div className="min-w-0 space-y-1">
                  <p className="font-black leading-snug">
                    {s.name}
                    {s.conditional && (
                      <span className="ml-2 rounded-full border border-base-content/30 px-2 py-0.5 text-xs font-bold">
                        ขึ้นกับเซิร์ฟเวอร์
                      </span>
                    )}
                  </p>
                  <p className="text-sm leading-snug text-base-content/70">{s.how}</p>
                  {(s.tradable || s.exchange) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {s.tradable && <TradeTag />}
                      {s.exchange && <ExchangeTag exchange={s.exchange} />}
                    </div>
                  )}
                  {s.requiresChapter ? (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm">
                      ต้องผ่าน <ChapterRef n={s.requiresChapter} showTown={false} />
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-base-200" aria-hidden>
                  <div
                    className={`h-full rounded-full ${s.conditional ? "bg-(--anv-ink)/35" : "bg-(--anv-ink)"}`}
                    style={{ width: `${(perWeek(s) / widest) * 100}%` }}
                  />
                </div>
                <p className="w-20 shrink-0 text-right leading-tight">
                  <span className="block text-xl font-black">{fmt(perWeek(s))}</span>
                  <span className="block text-xs font-bold text-base-content/70">ชิ้น/สัปดาห์</span>
                </p>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 py-3 font-black">
            <span>รวม Daily + Weekly + Dragon</span>
            <span className="text-xl">
              {fmt(ownPerWeek)} <span className="text-xs font-bold text-base-content/70">ชิ้น/สัปดาห์</span>
            </span>
          </li>
        </ul>
      </div>

      <details className="rounded-xl bg-base-200 p-4">
        <summary className="cursor-pointer font-black">ตัวเลขนี้คำนวณจากอะไร</summary>
        <ul className="mt-2 space-y-1">
          {WORLD_FRUIT_PLAN.assumptions.map((a) => (
            <li key={a} className="list-inside list-disc text-sm leading-snug">
              {a}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
