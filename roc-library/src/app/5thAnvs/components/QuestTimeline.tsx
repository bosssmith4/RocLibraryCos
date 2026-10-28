import { CHAPTER_QUESTS } from "@/data/anniversary5thQuests";

import { CutoutPicture } from "./QuestTaskRow";

const ART = "/assets/images/anvs";

interface Stop {
  step: number;
  title: string;
  /** one line: what it is */
  what: string;
  /** one line: how often or when */
  when: string;
  /** a picture that stands for the quest */
  picture: string;
  href: string;
}

const STOPS: Stop[] = [
  {
    step: 1,
    title: "Main Quest",
    what: `${CHAPTER_QUESTS.length} Chapter ตามเมือง`,
    when: "ทำครั้งเดียวต่อตัวละคร · เรียง I → VI",
    picture: `${ART}/landing/castle.svg`,
    href: "#map-title",
  },
  {
    step: 2,
    title: "Daily Quest",
    what: "เก็บวัตถุดิบ 3 อย่าง",
    when: "ทำได้วันละครั้ง · รอ 1 วัน",
    picture: `${ART}/items/25254.bmp`,
    href: "#recurring-title",
  },
  {
    step: 3,
    title: "Weekly Quest",
    what: "Shadow / Flame Stone และ Geffen Magic",
    when: "ทำทุกสัปดาห์",
    picture: `${ART}/items/105675.bmp`,
    href: "#recurring-title",
  },
  {
    step: 4,
    title: "Dragon Cataclysm",
    what: "ล่า Hydrolancer ×50",
    when: "ศุกร์–อาทิตย์ · พัก 4 วัน · หลังจบ Chapter V",
    picture: "/assets/images/monsterDb/1720.gif",
    href: "#recurring-title",
  },
];

/** The four things to do, in order, as a short timeline above the map. */
export default function QuestTimeline() {
  return (
    <nav aria-label="สรุปภารกิจ" className="space-y-3">
      <p className="text-center text-lg font-black">
        <span className="rounded-full bg-(--anv-ink) px-4 py-1 text-(--anv-cream)">ทำตามลำดับนี้</span>
      </p>
      <ol className="relative grid gap-4 sm:grid-cols-4 sm:gap-3">
        {/* the line the stops hang on: down the left on phones, across the top from sm */}
        <span
          aria-hidden
          className="absolute bottom-6 left-8 top-6 w-1.5 rounded-full bg-(--anv-orange)/50 sm:bottom-auto sm:left-6 sm:right-6 sm:top-9 sm:h-1.5 sm:w-auto"
        />
        {STOPS.map((stop) => (
          <li key={stop.title} className="relative">
            <a
              href={stop.href}
              className="group flex gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--anv-orange) sm:flex-col"
            >
              <span
                aria-hidden
                className="relative flex shrink-0 flex-col items-center justify-center self-start rounded-2xl border-4 border-base-100 bg-(--anv-orange) px-3 py-1 text-(--anv-ink) shadow-md"
              >
                <span className="text-[0.7rem] font-black uppercase leading-none tracking-widest">Step</span>
                <span className="text-3xl font-black leading-none">{stop.step}</span>
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-base-100 p-3 shadow transition-shadow group-hover:shadow-lg sm:flex-col sm:items-start">
                {stop.picture.endsWith(".bmp") ? (
                  <CutoutPicture
                    src={stop.picture}
                    className="h-14 w-14 shrink-0 object-contain"
                    fallback={null}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stop.picture} alt="" aria-hidden className="h-14 w-14 shrink-0 object-contain" />
                )}
                <span className="min-w-0 space-y-0.5">
                  <span className="block font-black leading-tight">{stop.title}</span>
                  <span className="block text-sm font-bold leading-snug">{stop.what}</span>
                  <span className="block text-sm leading-snug text-base-content/70">{stop.when}</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
