"use client";
import { useEffect, useRef, useState } from "react";
import JumpLink from "./JumpLink";

/** The page's main sections, in page order; the ids are the ones each section's heading carries. */
const SECTIONS = [
  { index: "01", title: "แผนที่ Chapter", id: "map-title" },
  { index: "02", title: "Quest ทำซ้ำ", id: "recurring-title" },
  { index: "03", title: "ข้อควรรู้", id: "story-guide-title" },
  { index: "04", title: "Reward & Exchange", id: "rewards-teaser-title" },
  { index: "05", title: "World Fruit", id: "fruit-plan-title" },
  { index: "06", title: "จุดวาร์ป", id: "warp-title" },
];

/** A heading this far (px) below the top of the screen, or higher, counts as the one being read: under the Navbar and this bar. */
const READING_LINE = 180;

/**
 * A row of buttons, one per main section, so a visitor sees how many there are and can jump to one.
 * The button of the section being read is filled in.
 */
export default function SectionNav() {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = (event?: Event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // the page scrolls inside the Shell, not the window; at its very end the last section counts
        const scroller = event?.target instanceof HTMLElement ? event.target : null;
        // only an element that really scrolls up and down counts (this row scrolls sideways)
        const atEnd =
          !!scroller &&
          scroller.scrollHeight > scroller.clientHeight &&
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
        let current: string | null = null;
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= READING_LINE) current = s.id;
        }
        setActive(atEnd ? SECTIONS[SECTIONS.length - 1].id : current);
      });
    };
    update();
    // scroll does not bubble, so listen in the capture phase to hear whichever element scrolls
    document.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, []);

  // on a narrow screen the row scrolls sideways: keep the active button in view
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>("[aria-current]");
    if (!list || !item) return;
    list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    // Sticks just under the fixed Navbar (h-16) once the page scrolls past it, and sits in place at the top.
    <nav
      aria-label="หัวข้อในหน้านี้"
      className="sticky top-16 z-30 -mx-4 space-y-1 border-b border-base-300 bg-base-100/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
    >
      <p className="text-center text-xs font-bold text-base-content/70">
        หน้านี้มี {SECTIONS.length} เรื่องหลัก
      </p>
      <ul ref={listRef} className="relative flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {SECTIONS.map((s) => (
          <li key={s.id} className="shrink-0">
            <JumpLink
              id={s.id}
              aria-current={active === s.id ? "location" : undefined}
              className={`flex items-center gap-2 rounded-full border-2 border-(--anv-orange) py-1 pl-1 pr-4 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anv-orange) ${
                active === s.id
                  ? "bg-(--anv-orange) text-(--anv-ink)"
                  : "bg-base-100 hover:bg-(--anv-orange)/25"
              }`}
            >
              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-black ${
                  active === s.id ? "bg-(--anv-ink) text-(--anv-cream)" : "bg-(--anv-orange) text-(--anv-ink)"
                }`}
              >
                {s.index}
              </span>
              {s.title}
            </JumpLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
