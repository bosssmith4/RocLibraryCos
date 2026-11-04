"use client";
import { useState, useRef, useEffect } from "react";
import EventModal from "./cenlab-modal";
import MonsterTablePage from "./monster-lab";
import LightCodePanel, { CodeReadout } from "./switch-on";
import StageTimers from "./stage-timers";
import { getThaiDateParts } from "@/utils/timezoneUtils";

export interface CalendarEvent {
  event_date: string;
  event_binary: string;
  event_code: string;
}

type TabType = "daily" | "calendar" | "monster";

// Navbar (4rem) + sticky tab bar + breathing room; mirrored by scroll-mt-28 on sections.
const SECTION_LINE_OFFSET = 112;
const DAYS_OF_WEEK = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const TABS: TabType[] = ["daily", "calendar", "monster"];
const DATE_CHECK_MS = 30 * 1000;

const buildEvent = (year: number, month: number, day: number): CalendarEvent => {
  const code = (day + (month + 1)) * 5;
  const base2 = code.toString(2).padStart(8, "0");
  return {
    event_date: new Date(year, month, day).toISOString(),
    event_binary: base2.slice(0, 4) + " " + base2.slice(4),
    event_code: code.toString(),
  };
};

export default function CentralLabPage() {
  // The code follows the date in Thailand, whatever the visitor's clock says.
  const [thaiDate, setThaiDate] = useState(() => getThaiDateParts(new Date()));
  const { year, day: today } = thaiDate;
  const month = thaiDate.month - 1;
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  const dailyRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);

  const getRefByTab = (tab: TabType) => {
    const refMap: Record<TabType, React.RefObject<HTMLDivElement>> = {
      daily: dailyRef,
      calendar: calendarRef,
      monster: monsterRef,
    };
    return refMap[tab];
  };

  const handleScrollTo = (tab: TabType) => {
    setActiveTab(tab);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Sections carry scroll-mt-28 so they stop below the navbar and tab bar.
    getRefByTab(tab).current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const tabRefs: { ref: React.RefObject<HTMLDivElement>; tab: TabType }[] = [
      { ref: dailyRef, tab: "daily" },
      { ref: calendarRef, tab: "calendar" },
      { ref: monsterRef, tab: "monster" },
    ];

    const onScroll = () => {
      const line = SECTION_LINE_OFFSET + 1;
      let current: TabType = "daily";
      tabRefs.forEach(({ ref, tab }) => {
        if (ref.current && ref.current.getBoundingClientRect().top <= line) {
          current = tab;
        }
      });
      // The last section can be too short to reach the line; treat the bottom as it.
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        current = "monster";
      }
      setActiveTab(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A page left open past 00:00 in Thailand moves on to the new day's code.
  useEffect(() => {
    const interval = setInterval(() => {
      const next = getThaiDateParts(new Date());
      setThaiDate((prev) =>
        prev.year === next.year && prev.month === next.month && prev.day === next.day
          ? prev
          : next,
      );
    }, DATE_CHECK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="antialiased sans-serif">
      {/* Navigation Tabs */}
      <TabNavigation activeTab={activeTab} onTabClick={handleScrollTo} />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:px-6 sm:py-8">
        {/* Daily Code Section */}
        <section ref={dailyRef} className="scroll-mt-28 space-y-10">
          <DailySection year={year} month={month} day={today} />
          <StageTimers />
        </section>

        {/* Calendar Section */}
        <section ref={calendarRef} className="scroll-mt-28">
          <CalendarSection
            year={year}
            month={month}
            today={today}
            onSelectEvent={setSelectedEvent}
          />
        </section>

        {/* Monster Section */}
        <section ref={monsterRef} className="scroll-mt-28">
          <MonsterTablePage />
        </section>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

/* ============ Sub Components ============ */

interface TabNavigationProps {
  activeTab: TabType;
  onTabClick: (tab: TabType) => void;
}

function TabNavigation({ activeTab, onTabClick }: TabNavigationProps) {
  return (
    <nav
      aria-label="Central Lab sections"
      className="sticky top-16 z-30 border-b border-base-300 bg-base-100 shadow-sm"
    >
      <div className="mx-auto flex max-w-3xl justify-around">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabClick(tab)}
            aria-current={activeTab === tab ? "true" : undefined}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center border-b-2 px-4 py-2 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-base-content/70 hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface DailySectionProps {
  year: number;
  month: number;
  day: number;
}

function DailySection({ year, month, day }: DailySectionProps) {
  const event = buildEvent(year, month, day);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-base-content sm:text-4xl">
          Central Laboratory
        </h1>
        <p className="mt-1 text-sm text-base-content/70 sm:text-base">
          รหัสวันนี้ {new Date(event.event_date).toLocaleDateString("th-TH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })} เปลี่ยนรหัสทุก 00:00 เวลาไทย
        </p>
      </header>

      <div className="grid items-stretch gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <CodeReadout code={event.event_code} binary={event.event_binary} />
        <LightCodePanel binary={event.event_binary} />
      </div>
    </div>
  );
}

interface CalendarSectionProps {
  year: number;
  month: number;
  today: number;
  onSelectEvent: (event: CalendarEvent) => void;
}

function CalendarSection({ year, month, today, onSelectEvent }: CalendarSectionProps) {
  const blankDays = new Date(year, month).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthTitle = new Date(year, month).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-base-content sm:text-3xl">{monthTitle}</h2>
        <p className="mt-1 text-sm text-base-content/70 sm:text-base">
          รหัสของทุกวันในเดือนนี้ กดวันที่เพื่อดูไฟในภาพ
        </p>
      </header>

      <div className="grid grid-cols-7 gap-1 rounded-box border border-base-300 bg-base-100 p-2 sm:gap-2 sm:p-4">
        {DAYS_OF_WEEK.map((name) => (
          <div
            key={name}
            className="py-1 text-center text-xs font-semibold text-base-content/70 sm:text-sm"
          >
            {name}
          </div>
        ))}

        {Array.from({ length: blankDays }, (_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = index + 1;
          return (
            <CalendarDay
              key={date}
              date={date}
              isToday={date === today}
              isPast={date < today}
              event={buildEvent(year, month, date)}
              onSelectEvent={onSelectEvent}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CalendarDayProps {
  date: number;
  isToday: boolean;
  isPast: boolean;
  event: CalendarEvent;
  onSelectEvent: (event: CalendarEvent) => void;
}

function CalendarDay({ date, isToday, isPast, event, onSelectEvent }: CalendarDayProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectEvent(event)}
      aria-current={isToday ? "date" : undefined}
      aria-label={`วันที่ ${date} รหัส ${event.event_code} ไฟ ${event.event_binary}${isToday ? " วันนี้" : ""}`}
      className={`flex min-h-20 cursor-pointer flex-col justify-between gap-1 rounded-field border p-1 text-left transition-colors hover:border-primary sm:min-h-24 sm:p-2 ${
        isToday
          ? "border-2 border-primary bg-primary/10"
          : "border-base-300"
      } ${isPast ? "opacity-60 hover:opacity-100" : ""}`}
    >
      <span className="flex items-center justify-between gap-1">
        <span
          className={`text-xs font-semibold sm:text-sm ${
            isToday ? "text-primary" : "text-base-content/70"
          }`}
        >
          {date}
        </span>
        {isToday && (
          <span className="hidden text-xs font-bold text-primary sm:inline">วันนี้</span>
        )}
      </span>
      <span className="text-base font-extrabold tabular-nums text-base-content sm:text-2xl">
        {event.event_code}
      </span>
      <LampDots binary={event.event_binary} />
    </button>
  );
}

/** The day's Light code in miniature: stacked in two rows where the cell is narrow. */
function LampDots({ binary }: { binary: string }) {
  return (
    <span aria-hidden="true" className="flex flex-col gap-0.5 sm:flex-row sm:gap-1.5">
      {binary.split(" ").map((group, groupIndex) => (
        <span key={groupIndex} className="flex gap-0.5 sm:gap-1">
          {group.split("").map((bit, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                bit === "1" ? "bg-accent" : "bg-base-content/20"
              }`}
            />
          ))}
        </span>
      ))}
    </span>
  );
}
