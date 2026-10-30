"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Check, Copy, MapPin, X } from "lucide-react";
import { MAPS, coordinateText, type MapCoordinate } from "@/utils/mapCoordinate";

// the 3D viewer is only fetched when a coordinate is clicked
const MapViewer = dynamic(() => import("@/components/MapViewer/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-3">
      <span className="loading loading-spinner" aria-hidden="true" />
      กำลังโหลดแมพ...
    </div>
  ),
});

/**
 * The map the coordinates point to, in a window, with a pin on each spot. With several spots
 * (all on one map) every pin carries its number and a row of buttons flies to one of them or
 * takes them all in. Esc, the × button or a click outside closes it (only this window, even
 * when it was opened from another one).
 */
export default function MapLocationModal({
  coordinates,
  onClose,
}: {
  coordinates: MapCoordinate[];
  onClose: () => void;
}) {
  const first = coordinates[0];
  const map = MAPS[first.map];
  const many = coordinates.length > 1;
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [copied, setCopied] = useState(false);
  /** the pin the camera is on; undefined while it takes them all in */
  const [focus, setFocus] = useState<number | undefined>(many ? undefined : 0);
  // one array for the whole life of the window, so the viewer pins the spots once
  const [markers] = useState(() => coordinates.map((c) => ({ x: c.x, y: c.y })));

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // capture phase on window: this window takes Esc before a window it was opened from sees it
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      opener?.focus?.();
    };
  }, []);

  const shown = focus === undefined ? coordinates : [coordinates[focus]];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown.map(coordinateText).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // the clipboard can be blocked; the coordinates are still there to read
    }
  };

  return createPortal(
    <dialog
      open
      aria-labelledby="map-location-title"
      className="modal modal-open"
      onClick={onClose}
    >
      <div
        className="anvs modal-box flex h-[90vh] max-h-[90vh] w-[95vw] max-w-none flex-col gap-3 sm:w-[80vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <MapPin aria-hidden className="h-6 w-6 shrink-0 text-(--anv-orange)" />
          <h2 id="map-location-title" className="min-w-0 flex-1 text-lg font-black leading-snug">
            {map?.name ?? first.map} ·{" "}
            {many ? `${first.map} ทั้ง ${coordinates.length} จุด` : `${first.map} ${first.x}, ${first.y}`}
          </h2>
          <button type="button" className="btn btn-sm gap-2" onClick={copy}>
            {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
            {copied ? "คัดลอกแล้ว" : many && focus === undefined ? "คัดลอกทุกจุด" : "คัดลอกพิกัด"}
          </button>
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-(--anv-orange)"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {many && (
          <div role="group" aria-label="เลือกจุด" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={focus === undefined}
              onClick={() => setFocus(undefined)}
              className={`btn btn-sm ${focus === undefined ? "border-0 bg-(--anv-orange) text-(--anv-ink)" : "btn-outline"}`}
            >
              ดูทุกจุด
            </button>
            {coordinates.map((c, i) => (
              <button
                key={`${c.x}-${c.y}`}
                type="button"
                aria-pressed={focus === i}
                onClick={() => setFocus(i)}
                className={`btn btn-sm font-mono ${focus === i ? "border-0 bg-(--anv-orange) text-(--anv-ink)" : "btn-outline"}`}
              >
                {i + 1} · {c.x}, {c.y}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1">
          {map ? (
            <MapViewer
              embedded
              name={first.map}
              title={map.name}
              markers={markers}
              focusIndex={focus}
              errorContent={
                <div className="space-y-2">
                  <p className="text-lg font-black">ยังไม่มีแมพ {first.map} ในเว็บ</p>
                  <p className="text-base-content/70">{map.name}</p>
                  {coordinates.map((c, i) => (
                    <p key={`${c.x}-${c.y}`} className="font-mono text-base-content/70">
                      {many ? `${i + 1} · ` : ""}X {c.x}, Y {c.y}
                    </p>
                  ))}
                </div>
              }
            />
          ) : (
            <p className="p-6 text-center text-base-content/70">ไม่รู้จักแมพ {first.map}</p>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
