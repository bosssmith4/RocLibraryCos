"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import LightCodePanel, { CodeReadout } from "./switch-on";
import type { CalendarEvent } from "./page";

interface EventModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cenlab-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral/80 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-5xl overflow-y-auto rounded-box bg-base-100 p-4 shadow-lg sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="cenlab-modal-title" className="text-xl font-bold text-base-content sm:text-2xl">
            {new Date(event.event_date).toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="btn btn-ghost btn-square min-h-11 min-w-11 shrink-0"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <CodeReadout code={event.event_code} binary={event.event_binary} />
          <LightCodePanel binary={event.event_binary} />
        </div>
      </div>
    </div>
  );
};

export default EventModal;
