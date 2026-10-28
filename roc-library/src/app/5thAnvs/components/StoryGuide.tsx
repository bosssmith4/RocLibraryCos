import { AlertTriangle, CalendarDays, MapPin } from "lucide-react";
import { STORY_GUIDE } from "@/data/anniversary5thGuide";
import { CoordinateText } from "./CoordinateLink";
import JourneyStrip from "./JourneyStrip";
import SectionHeading from "./SectionHeading";

const OFFICIAL = "https://roc.gnjoy.in.th/event/all-server-5th-anniversary-story-quest/";

/** Section 02: what applies across the Chapters, the job-change trips and the equipment costs. */
export default function StoryGuide({ index }: { index: string }) {
  const g = STORY_GUIDE;
  return (
    <section aria-labelledby="story-guide-title" className="space-y-5">
      <SectionHeading index={index} title="ข้อควรรู้ & เปลี่ยนอาชีพ" id="story-guide-title" />
      <p className="inline-flex items-center gap-2 rounded-full bg-(--anv-ink) px-4 py-1.5 font-black text-(--anv-cream)">
        <CalendarDays aria-hidden className="h-5 w-5" />
        {g.period}
      </p>

      <JourneyStrip />


      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-2 rounded-2xl border-2 border-(--anv-orange)/40 p-4">
          <h3 className="font-black">หลัง Chapter II · Hi Novice (Job 10)</h3>
          <ul className="grid gap-1.5 text-sm">
            {g.hiNovice.map((s) => (
              <li key={s.job} className="flex items-center gap-2 rounded-xl bg-base-200 px-3 py-1.5">
                <MapPin aria-hidden className="h-4 w-4 shrink-0 text-(--anv-orange)" />
                <span className="font-bold">{s.job}</span>
                <span className="ml-auto text-right text-base-content/80">{s.place}</span>
              </li>
            ))}
          </ul>
          <h3 className="pt-2 font-black">Hi Class (Job 40+)</h3>
          <ol className="space-y-1.5 text-sm">
            {g.hiClass.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--anv-orange) text-xs font-black text-(--anv-ink)">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2 rounded-2xl border-2 border-(--anv-orange)/40 p-4">
          <h3 className="font-black">อุปกรณ์จาก Chapter และค่าใช้จ่าย</h3>
          <ul className="space-y-3 text-sm">
            {g.equipment.map((e) => (
              <li key={e.name} className="space-y-0.5 rounded-xl bg-base-200 p-3">
                <p className="font-bold">
                  {e.name} <span className="font-normal text-base-content/70">· {e.from}</span>
                </p>
                <p className="text-base-content/80">
                  <CoordinateText text={e.detail} />
                </p>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-sm text-base-content/70">
            รูปชุดอุปกรณ์ทั้งหมด (Grace Spirit, Probation +7, Noblesse) ดูที่{" "}
            <a href={OFFICIAL} target="_blank" rel="noreferrer" className="underline">
              หน้าทางการ
            </a>
          </p>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl bg-(--anv-orange)/10 p-4">
        <h3 className="flex items-center gap-2 font-black">
          <AlertTriangle aria-hidden className="h-5 w-5 text-(--anv-orange)" />
          ข้อควรรู้ก่อนเริ่ม
        </h3>
        <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {g.notes.map((note) => (
            <li key={note} className="list-inside list-disc text-sm leading-snug marker:text-(--anv-orange)">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
