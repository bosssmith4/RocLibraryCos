import { CalendarDays } from "lucide-react";
import { STORY_GUIDE } from "@/data/anniversary5thGuide";

const ART = "/assets/images/anvs/landing";

/** Props floating around the title: [file, position/size classes, seconds of delay]. */
const PROPS: [string, string, string][] = [
  ["balloon.svg", "left-0 top-0 w-12 sm:left-6 sm:w-20", "0s"],
  ["party-hat.svg", "left-[17%] bottom-1 hidden w-12 sm:block", "-1.2s"],
  ["star.svg", "right-[14%] top-0 hidden w-10 sm:block", "-2.1s"],
  ["gift.svg", "right-0 bottom-0 w-14 sm:right-6 sm:w-20", "-0.6s"],
];

/** The page's poster title: the big "5" with its outline and shadow, and a few floating props. */
export default function TitleBanner() {
  return (
    <header className="relative mx-auto max-w-3xl px-14 py-4 text-center sm:px-28">
      {PROPS.map(([file, className, delay]) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={file}
          src={`${ART}/${file}`}
          alt=""
          aria-hidden
          className={`anvs-bob pointer-events-none absolute h-auto drop-shadow-lg ${className}`}
          style={{ animationDelay: delay }}
        />
      ))}
      <p className="text-xs font-bold uppercase tracking-widest text-base-content/70 sm:text-sm">
        Ragnarok Online Classic
      </p>
      <h1 aria-label="5th Anniversary" className="flex items-end justify-center gap-2 leading-none">
        <span aria-hidden className="anvs-glyph text-7xl font-black sm:text-8xl">
          5
        </span>
        <span aria-hidden className="pb-2 text-left text-xl font-black uppercase leading-tight tracking-wide sm:text-3xl">
          th
          <br />
          Anniversary
        </span>
      </h1>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-(--anv-ink) px-4 py-1.5 text-base font-black text-(--anv-cream)">
        <CalendarDays aria-hidden className="h-5 w-5" />
        {STORY_GUIDE.period}
      </p>
      <p className="mt-2 text-base-content/70">
        <span className="block font-bold">Chapter 6 เมือง</span>
        <span className="block text-sm">ชี้ที่เมืองเพื่อดูเนื้อเรื่อง · คลิกเพื่อดูภารกิจ</span>
      </p>
    </header>
  );
}
