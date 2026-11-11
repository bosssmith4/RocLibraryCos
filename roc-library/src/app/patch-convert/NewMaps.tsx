"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, X } from "lucide-react";
import { newMaps } from "@/data/patchMap";
import { MAPS } from "@/utils/mapCoordinate";

// The 3D viewer is only fetched once the window opens.
const MapViewer = dynamic(() => import("@/components/MapViewer/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-3">
      <span className="loading loading-spinner" aria-hidden="true" />
      กำลังโหลดแมพ...
    </div>
  ),
});

/** The patch's New maps; empty until loaded, and while the patch has none. */
export function useNewMaps() {
  const [maps, setMaps] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    newMaps().then((names) => {
      if (!cancelled) setMaps(names);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return maps;
}

export function NewMapsButton({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="btn btn-outline min-h-11 gap-2"
    >
      <MapIcon aria-hidden="true" className="h-5 w-5" />
      แผนที่ใหม่ ({count})
    </button>
  );
}

/**
 * The patch's New maps in a window: their names, and the chosen one in the Map viewer.
 * The names sit beside the map on a wide screen and above it on a phone.
 */
export function NewMapsModal({
  maps,
  onClose,
}: {
  maps: string[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(maps[0]);
  const label = MAPS[current]?.name;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="new-maps-title"
      className="modal"
    >
      <div className="modal-box flex h-[90dvh] max-h-[90dvh] w-[95vw] max-w-6xl flex-col gap-3 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <MapIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
          <h2 id="new-maps-title" className="min-w-0 flex-1 text-lg font-bold">
            แผนที่ใหม่ในแพตช์นี้
          </h2>
          <form method="dialog">
            <button
              aria-label="ปิด"
              className="btn btn-circle btn-ghost btn-sm min-h-11 min-w-11"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-1">
          <nav aria-label="รายชื่อแผนที่ใหม่" className="min-h-0 overflow-y-auto">
            <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-x-visible md:pb-0">
              {maps.map((name) => (
                <li key={name} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={name === current}
                    onClick={() => setCurrent(name)}
                    className={`flex min-h-11 w-full flex-col items-start justify-center rounded-box border px-3 py-2 text-left transition-colors ${
                      name === current
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:bg-base-200"
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold">{name}</span>
                    {MAPS[name] && (
                      <span className="text-xs text-base-content/60">
                        {MAPS[name].name}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-h-0 overflow-hidden rounded-box border border-base-300">
            <MapViewer
              key={current}
              embedded
              name={current}
              title={label ?? current}
              errorContent={
                <div className="space-y-2">
                  <p className="text-lg font-bold">ยังไม่มีไฟล์แผนที่ {current} ในเว็บ</p>
                  {label && <p className="text-base-content/70">{label}</p>}
                </div>
              }
            />
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button aria-label="ปิด">ปิด</button>
      </form>
    </dialog>
  );
}
