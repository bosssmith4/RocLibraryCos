import { ArrowDown, ArrowRight, Clock, Lock, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { CHAPTER_QUESTS } from "@/data/anniversary5thQuests";
import { CutoutPicture } from "./QuestTaskRow";
import { REGION_COLORS } from "./chapterMapLayout";

const ART = "/assets/images/anvs";
const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];
/** Thai weekday letters from Monday, so Fri, Sat and Sun sit together; the Dragon Cataclysm runs on Fri, Sat and Sun. */
const WEEK = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const DRAGON_DAYS = new Set(["ศ", "ส", "อา"]);

/** One box of the flow: a big step label, a picture, a title and a few lines. */
function StepCard({
  label,
  title,
  picture,
  href,
  children,
}: {
  label: string;
  title: string;
  picture: ReactNode;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex h-full flex-col gap-2 rounded-2xl border-2 border-(--anv-orange) bg-base-100 p-3 shadow transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--anv-orange)"
    >
      <span className="w-fit rounded-full bg-(--anv-orange) px-3 py-0.5 text-sm font-black uppercase tracking-wide text-(--anv-ink)">
        {label}
      </span>
      <span className="flex items-center gap-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center">{picture}</span>
        <span className="min-w-0 space-y-1">
          <span className="block text-lg font-black leading-tight">{title}</span>
          {children}
        </span>
      </span>
    </a>
  );
}

/** A small badge: the loop of a repeating quest, with how long until it can be done again. */
function Loop({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--anv-ink) px-3 py-1 text-sm font-black text-(--anv-cream)">
      <RefreshCw aria-hidden className="h-4 w-4" />
      {children}
    </span>
  );
}

/** The Chapter a quest needs first, in that Chapter's own colour, so it matches Step 2 above. */
function Needs({ chapter }: { chapter: number }) {
  const i = chapter - 1;
  return (
    <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-(--anv-orange)/15 py-0.5 pl-1 pr-3 text-sm font-black">
      <span
        aria-hidden
        className="flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[0.7rem] font-black text-white"
        style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }}
      >
        {NUMERALS[i]}
      </span>
      <Lock aria-hidden className="h-4 w-4" />
      ต้องผ่าน Chapter {NUMERALS[i]}
    </span>
  );
}

function ResetAt() {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold">
      <Clock aria-hidden className="h-4 w-4" />
      รีเซ็ต 04:00
    </span>
  );
}

const Down = () => (
  <ArrowDown aria-hidden className="mx-auto h-7 w-7 text-(--anv-orange) lg:hidden" strokeWidth={3} />
);
const Right = () => (
  <ArrowRight aria-hidden className="hidden h-8 w-8 shrink-0 self-center text-(--anv-orange) lg:block" strokeWidth={3} />
);

/**
 * How a new character moves through the event, as a flow: be born a Novice, take the
 * Chapter quests, then three quests that each repeat on their own clock.
 */
export default function QuestTimeline() {
  return (
    <nav aria-label="ลำดับการเล่นกิจกรรม" className="space-y-3">
      <p className="text-center text-lg font-black">
        <span className="rounded-full bg-(--anv-ink) px-4 py-1 text-(--anv-cream)">ทำตามลำดับนี้</span>
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-center">
        <div className="lg:w-72 lg:shrink-0">
          <StepCard
            label="Step 1"
            title="เกิดใหม่เป็น Novice"
            href="#map-title"
            picture={
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${ART}/chapters/novice.svg`} alt="" aria-hidden className="h-16 w-16 object-contain" />
            }
          >
            <span className="block text-sm text-base-content/70">เริ่มตัวละครใหม่ แล้วไปรับเควส</span>
          </StepCard>
        </div>

        <Down />
        <Right />

        <div className="lg:w-80 lg:shrink-0">
          <StepCard
            label="Step 2"
            title="รับ Quest Chapter"
            href="#map-title"
            picture={
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${ART}/landing/castle.svg`} alt="" aria-hidden className="h-14 w-14 object-contain" />
            }
          >
            <span className="block text-sm text-base-content/70">ทำเรียง I → VI ครั้งเดียวต่อตัวละคร</span>
            <span className="flex flex-wrap gap-1">
              {CHAPTER_QUESTS.map((q, i) => (
                <span
                  key={q.town}
                  title={q.town}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-black text-white"
                  style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }}
                >
                  {NUMERALS[i] ?? i + 1}
                </span>
              ))}
            </span>
          </StepCard>
        </div>
        </div>

        <Down />
        <ArrowDown
          aria-hidden
          className="mx-auto hidden h-7 w-7 text-(--anv-orange) lg:block"
          strokeWidth={3}
        />

        <div className="flex min-w-0 flex-col gap-2 rounded-2xl border-2 border-dashed border-(--anv-orange) p-2">
          <p className="px-1 text-sm font-black text-(--anv-orange)">Step 3 · ทำวนซ้ำได้ทั้ง 3 อย่าง</p>
          <div className="grid gap-2 lg:grid-cols-3">

          <StepCard
            label="3.1 Daily"
            title="Daily Quest"
            href="#recurring-title"
            picture={
              <CutoutPicture src={`${ART}/items/25254.bmp`} className="h-14 w-14 object-contain" fallback={null} />
            }
          >
            <span className="flex flex-wrap items-center gap-1.5">
              <Loop>ทุกวัน · CD 1 วัน</Loop>
              <ResetAt />
            </span>
            <Needs chapter={3} />
            <span className="block text-sm text-base-content/70">เควสสุ่ม · ทำวันนี้ พรุ่งนี้หลัง 04:00 ทำได้อีก</span>
          </StepCard>

          <StepCard
            label="3.2 Weekly"
            title="Weekly Quest"
            href="#recurring-title"
            picture={
              <CutoutPicture src={`${ART}/items/105675.bmp`} className="h-14 w-14 object-contain" fallback={null} />
            }
          >
            <span className="flex flex-wrap items-center gap-1.5">
              <Loop>สัปดาห์ละครั้ง · CD 7 วัน</Loop>
              <ResetAt />
            </span>
            <Needs chapter={4} />
            <span className="block text-sm text-base-content/70">
              เช่น ทำวันพฤหัส ทำได้อีกพฤหัสสัปดาห์หน้าตอน 04:00
            </span>
          </StepCard>

          <StepCard
            label="3.3 Dragon"
            title="Dragon Cataclysm"
            href="#recurring-title"
            picture={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/assets/images/monsterDb/1720.gif" alt="" aria-hidden className="h-14 w-14 object-contain" />
            }
          >
            <span className="flex flex-wrap items-center gap-1.5">
              <Loop>ทำได้เฉพาะ ศ · ส · อา</Loop>
            </span>
            <Needs chapter={5} />
            <span className="flex gap-1" role="img" aria-label="วันที่ทำได้: ศุกร์ เสาร์ อาทิตย์">
              {WEEK.map((d) => (
                <span
                  key={d}
                  aria-hidden
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-black ${
                    DRAGON_DAYS.has(d)
                      ? "bg-(--anv-orange) text-(--anv-ink)"
                      : "bg-base-200 text-base-content/40"
                  }`}
                >
                  {d}
                </span>
              ))}
            </span>
          </StepCard>
          </div>
        </div>
      </div>
    </nav>
  );
}
