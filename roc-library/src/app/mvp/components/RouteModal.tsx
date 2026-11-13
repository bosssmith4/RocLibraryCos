"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Flag, MessageCircle, Route as RouteIcon, X } from "lucide-react";
import { findRoute, minimapPosition, type MapLinks, type RouteStep } from "@/utils/mapRoute";
import type { MapSpawn } from "@/types/monster";

interface RouteModalProps {
  mvpName: string;
  spawn: MapSpawn;
  /** undefined when the Warp list could not be loaded */
  links: MapLinks | undefined;
  town: string;
  onTownChange: (town: string) => void;
  onClose: () => void;
}

export default function RouteModal({ mvpName, spawn, links, town, onTownChange, onClose }: RouteModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const mapName = (map: string) => links?.maps[map]?.name ?? map;
  // The Warp list may stop short of the Spawn map; routeVia names how far it goes.
  const reachable = spawn.routeVia ?? spawn.map;
  const steps = links ? findRoute(links, town, reachable) : undefined;
  const arrives = steps !== undefined && reachable === spawn.map;

  return createPortal(
    <dialog open aria-labelledby="mvp-route-title" className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box flex max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <RouteIcon aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 id="mvp-route-title" className="text-lg font-bold leading-snug text-base-content">
              เส้นทางไปหา {mvpName}
            </h2>
            <p className="text-sm text-base-content/70">
              {mapName(spawn.map)} <span className="font-mono">({spawn.map})</span>
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm shrink-0"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-base-content">
          เริ่มจากเมือง
          <select
            className="select select-bordered select-sm"
            value={town}
            onChange={(e) => onTownChange(e.target.value)}
            disabled={!links}
          >
            {(links?.towns ?? [town]).map((id) => (
              <option key={id} value={id}>
                {mapName(id)}
              </option>
            ))}
          </select>
        </label>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {!links ? (
            <p className="py-6 text-center text-base-content/70">โหลดข้อมูลเส้นทางไม่ได้ ลองเปิดหน้าใหม่อีกครั้ง</p>
          ) : steps === undefined ? (
            <p className="rounded-lg bg-base-200 p-4 text-base-content/80">
              {spawn.routeNote ?? "ยังไม่มีข้อมูลเส้นทาง"}
            </p>
          ) : (
            <>
              <p className="text-sm text-base-content/70">
                {steps.length === 0 && arrives
                  ? "เมืองนี้คือแมพที่บอสเกิด"
                  : `ผ่าน ${steps.length} Warp`}
              </p>
              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <StepRow key={`${step.map}-${step.to}`} index={i + 1} step={step} links={links} />
                ))}
                <li className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <Flag aria-hidden className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base-content">
                      {arrives ? "ถึงแมพที่บอสเกิด" : "ข้อมูล Warp ของเกมมีถึงตรงนี้"}: {mapName(reachable)}{" "}
                      <span className="font-mono text-sm text-base-content/70">({reachable})</span>
                    </p>
                    {!arrives && (
                      <p className="mt-1 text-sm text-base-content/80">
                        {spawn.routeNote ?? "ยังไม่มีข้อมูลเส้นทางช่วงที่เหลือ"}
                      </p>
                    )}
                    {arrives && spawn.routeNote && (
                      <p className="mt-1 text-sm text-base-content/80">{spawn.routeNote}</p>
                    )}
                  </div>
                  <Minimap map={reachable} links={links} />
                </li>
              </ol>
            </>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

function StepRow({ index, step, links }: { index: number; step: RouteStep; links: MapLinks }) {
  const name = (map: string) => links.maps[map]?.name ?? map;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold text-base-content">
          {name(step.map)} <span className="font-mono text-sm font-normal text-base-content/70">({step.map})</span>
        </p>
        <p className="text-sm text-base-content/80">
          {step.npc ? (
            <>
              <MessageCircle aria-hidden className="mr-1 inline h-4 w-4 text-primary" />
              คุยกับ NPC <span className="font-semibold">{step.npc}</span> ที่{" "}
            </>
          ) : (
            "เดินเข้า Warp ที่ "
          )}
          <span className="font-mono font-semibold text-base-content">
            {step.x}, {step.y}
          </span>
        </p>
        <p className="text-sm text-base-content/70">
          ไป {name(step.to)} <span className="font-mono">({step.to})</span>
        </p>
      </div>
      <Minimap map={step.map} links={links} dot={{ x: step.x, y: step.y }} />
    </li>
  );
}

/** The map's minimap picture, with a pulsing dot on the cell to go to. Nothing when the site has no picture. */
function Minimap({ map, links, dot }: { map: string; links: MapLinks; dot?: { x: number; y: number } }) {
  const info = links.maps[map];
  if (!info?.img) return null;
  const at = dot && minimapPosition(info, dot.x, dot.y);
  return (
    // the game draws minimaps for a dark window, so they keep a dark ground in both Theme modes
    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral sm:h-40 sm:w-40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/assets/images/minimap/${map}.webp`}
        alt={dot ? `แผนที่ ${info.name} จุด Warp ที่ ${dot.x}, ${dot.y}` : `แผนที่ ${info.name}`}
        loading="lazy"
        className="h-full w-full"
      />
      {at && (
        <span
          aria-hidden
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${at.left * 100}%`, top: `${at.top * 100}%` }}
        >
          <span className="absolute inset-0 rounded-full bg-warning motion-safe:animate-ping" />
          <span className="absolute inset-0 rounded-full border-2 border-white bg-warning" />
        </span>
      )}
    </div>
  );
}
