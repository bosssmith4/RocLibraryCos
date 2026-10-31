import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { STORY_GUIDE } from "@/data/anniversary5thGuide";
import { CoordinateText } from "./CoordinateLink";
import SectionHeading from "./SectionHeading";
import SourceRef from "./SourceRef";

const OFFICIAL = "https://roc.gnjoy.in.th/event/all-server-5th-anniversary-story-quest/";

/** A reference table: a heading, then rows divided by thin rules, with no box around each row. */
function Table({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="border-b-2 border-(--anv-ink) pb-1 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Section 04, last because it is looked up, not followed: the notes that apply to every
 * Chapter, the job-change trips and the equipment costs.
 */
export default function StoryGuide({ index }: { index: string }) {
  const g = STORY_GUIDE;
  return (
    <section aria-labelledby="story-guide-title" className="space-y-6">
      <SectionHeading index={index} title="ข้อควรรู้ & เปลี่ยนอาชีพ" id="story-guide-title" />

      <div className="space-y-2 rounded-xl bg-(--anv-orange)/10 p-4">
        <h3 className="flex items-center gap-2 font-black">
          <AlertTriangle aria-hidden className="h-5 w-5 text-(--anv-orange)" />
          ข้อควรรู้ก่อนเริ่ม
        </h3>
        <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {g.notes.map((note) => (
            <li key={note} className="list-inside list-disc text-sm leading-snug marker:text-(--anv-orange)">
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <Table title="หลัง Chapter II · Hi Novice (Job 10)">
            <ul className="divide-y divide-base-300">
              {g.hiNovice.map((s) => (
                <li key={s.job} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                  <span className="font-black">{s.job}</span>
                  <span className="text-right text-base-content/80">{s.place}</span>
                </li>
              ))}
            </ul>
          </Table>
          <Table title="Hi Class (Job 40+)">
            <ol className="divide-y divide-base-300">
              {g.hiClass.map((step, i) => (
                <li key={step} className="flex items-baseline gap-3 py-1.5 text-sm">
                  <span className="w-5 shrink-0 font-black text-(--anv-orange)">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Table>
        </div>

        <Table title="อุปกรณ์จาก Chapter และค่าใช้จ่าย">
          <ul className="divide-y divide-base-300">
            {g.equipment.map((e) => (
              <li key={e.name} className="space-y-0.5 py-2 text-sm">
                <p className="font-black">
                  {e.name} <span className="font-normal text-base-content/70">· {e.from}</span>
                </p>
                <p className="leading-snug text-base-content/80">
                  <CoordinateText text={e.detail} />
                </p>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-sm text-base-content/70">
            รูปชุดอุปกรณ์ทั้งหมด (Grace Spirit, Probation +7, Noblesse) ดูที่{" "}
            <a href={OFFICIAL} target="_blank" rel="noreferrer" className="underline">
              หน้าทางการ
            </a>
          </p>
        </Table>
      </div>
      <SourceRef href="https://roc.gnjoy.in.th/event/world-event-five/" title="World Event Five" />
    </section>
  );
}
