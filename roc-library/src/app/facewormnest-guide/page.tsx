"use client";

import Image from "next/image";
import { useState } from "react";
import MapViewer from "@/components/MapViewer/MapViewer";
import type { MapPin, MapRoute } from "@/components/MapViewer/mapScene";
import { facewormNestMapData } from "@/services/mapData/facewormNestData";
import type { MapMarker } from "@/types/facewormNest";

type Zone = number | "all";

interface Filters {
  warp: boolean;
  chest: boolean;
  miniBoss: boolean;
  mvp: boolean;
  routes: boolean;
}

const ICONS = "/assets/images/facewormnest";

const ZONES: Zone[] = ["all", 1, 2, 3, 4];

/** The data keeps each cell as [x, y], the numbers the game shows. */
const cell = ([x, y]: [number, number]) => ({ x, y });

/** "prop_1_10" -> "1.10": the Zone and the order in it. */
const chestNumber = (id: string) => id.replace("prop_", "").replace("_", ".");

const zoneOf = (marker: MapMarker) => marker.stage ?? 1;

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** The description keeps "Label:value" lines and, for the MVP, one plain line first. */
function readDescription(description: string) {
  const facts: { label: string; value: string }[] = [];
  const notes: string[] = [];
  for (const line of description.split("<br>").map((l) => l.trim()).filter(Boolean)) {
    const at = line.indexOf(":");
    if (at > 0) facts.push({ label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() });
    else notes.push(line);
  }
  return { facts, notes };
}

function MonsterCard({ marker, mvp }: { marker: MapMarker; mvp?: boolean }) {
  const { facts, notes } = readDescription(marker.description);
  return (
    <li className={`flex gap-4 rounded-box border border-base-300 bg-base-100 p-4 ${mvp ? "md:col-span-2" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ICONS}/${mvp ? "boss" : "mini"}.gif`}
        alt=""
        loading="lazy"
        className={`shrink-0 rounded-xl bg-base-200 object-contain ${mvp ? "h-28 w-28" : "h-20 w-20"}`}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold leading-tight">{marker.name}</h3>
          {mvp && <span className="badge badge-warning font-bold">MVP</span>}
          {marker.level && <span className="badge badge-outline">Lv. {marker.level}</span>}
        </div>
        {notes.map((note) => (
          <p key={note} className="text-sm text-base-content/70">
            {note}
          </p>
        ))}
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
          {facts.map((f) => (
            <div key={f.label} className="contents">
              <dt className="text-base-content/70">{f.label}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
        {marker.drops && (
          <p className="text-sm">
            <span className="text-base-content/70">ดรอป </span>
            {marker.drops.join(", ")}
          </p>
        )}
      </div>
    </li>
  );
}

export default function FacewormNestGuidePage() {
  const [zone, setZone] = useState<Zone>("all");
  const [filters, setFilters] = useState<Filters>({ warp: true, chest: true, miniBoss: true, mvp: true, routes: true });

  const inZone = (z: number | undefined) => zone === "all" || z === undefined || z === zone;

  const chests = facewormNestMapData.treasure.filter((t) => inZone(zoneOf(t)));
  const paths = (facewormNestMapData.paths ?? []).filter((p) => inZone(p.stage));
  const chestCount = (z: Zone) =>
    z === "all" ? facewormNestMapData.treasure.length : facewormNestMapData.treasure.filter((t) => zoneOf(t) === z).length;

  const pins: MapPin[] = [
    ...(filters.warp
      ? facewormNestMapData.warp.map((m) => ({ ...cell(m.coordinates), kind: "warp" as const, image: `${ICONS}/warp-small.png` }))
      : []),
    ...(filters.chest
      ? chests.map((m) => ({ ...cell(m.coordinates), kind: "chest" as const, image: `${ICONS}/teasure.gif` }))
      : []),
    ...(filters.miniBoss
      ? facewormNestMapData.miniBosses.map((m) => ({ ...cell(m.coordinates), kind: "miniBoss" as const, image: `${ICONS}/mini.gif` }))
      : []),
    ...(filters.mvp
      ? facewormNestMapData.bosses.map((m) => ({ ...cell(m.coordinates), kind: "mvp" as const, image: `${ICONS}/boss.gif` }))
      : []),
  ];
  const routes: MapRoute[] = filters.routes ? paths.map((p) => ({ points: p.coordinates.map(cell) })) : [];

  const layers: { key: keyof Filters; label: string; icon?: string; count: number }[] = [
    { key: "warp", label: "Warp", icon: "warp-small.png", count: facewormNestMapData.warp.length },
    { key: "chest", label: "หีบสมบัติ", icon: "teasure.gif", count: chests.length },
    { key: "miniBoss", label: "Mini boss", icon: "mini.gif", count: facewormNestMapData.miniBosses.length },
    { key: "mvp", label: "MVP", icon: "boss.gif", count: facewormNestMapData.bosses.length },
    { key: "routes", label: "เส้นทางแนะนำ", count: paths.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Image
          src={`${ICONS}/logo.webp`}
          alt=""
          width={400}
          height={200}
          priority
          className="h-14 w-auto rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">Faceworm Nest</h1>
          <p className="text-base-content/70">แมพ 3 มิติ พร้อมตำแหน่ง Warp, หีบสมบัติ, Mini boss และ MVP</p>
        </div>
        <p className="text-sm text-base-content/60">ขอบคุณข้อมูลจาก Peet ROC</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-2">
          <div className="h-[70svh] min-h-[26rem]">
            <MapViewer name="1@face" title="Faceworm Nest" embedded pins={pins} routes={routes} />
          </div>
          <p className="text-sm text-base-content/60">ลากเพื่อหมุน ล้อเมาส์หรือถ่างนิ้วเพื่อซูม</p>
        </div>

        <aside className="space-y-5 rounded-box border border-base-300 bg-base-100 p-4 lg:self-start">
          <section aria-labelledby="fn-layers" className="space-y-2">
            <h2 id="fn-layers" className="font-bold">
              แสดงบนแมพ
            </h2>
            <ul className="space-y-1">
              {layers.map(({ key, label, icon, count }) => (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-base-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${ICONS}/${icon}`} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span aria-hidden className="h-1 w-6 rounded-full bg-error" />
                      )}
                    </span>
                    <span className="flex-1">{label}</span>
                    <span className="text-sm tabular-nums text-base-content/60">{count}</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={filters[key]}
                      onChange={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="fn-zones" className="space-y-2">
            <h2 id="fn-zones" className="font-bold">
              โซน
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((z) => (
                <button
                  key={z}
                  type="button"
                  aria-pressed={zone === z}
                  className={`btn btn-sm justify-between ${FOCUS} ${zone === z ? "btn-primary" : "btn-outline"} ${
                    z === "all" ? "col-span-2" : ""
                  }`}
                  onClick={() => setZone(z)}
                >
                  <span>{z === "all" ? "ทุกโซน" : `โซน ${z}`}</span>
                  <span className="tabular-nums opacity-70">{chestCount(z)}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-base-content/60">ตัวเลขคือจำนวนหีบ โซนกรองเฉพาะหีบและเส้นทาง</p>
          </section>
        </aside>
      </div>

      <section aria-labelledby="fn-chests" className="space-y-3">
        <h2 id="fn-chests" className="text-xl font-bold">
          หีบสมบัติ {zone === "all" ? "ทุกโซน" : `โซน ${zone}`}
          <span className="ml-2 text-base font-normal text-base-content/60">{chests.length} หีบ</span>
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {chests.map((chest) => (
            <li key={chest.id} className="relative overflow-hidden rounded-box border border-base-300 bg-base-100">
              {chest.imagePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={chest.imagePath}
                  alt={`หีบสมบัติ ${chestNumber(chest.id)}`}
                  loading="lazy"
                  className="aspect-video w-full bg-base-200 object-cover"
                />
              )}
              <span className="badge badge-neutral absolute left-2 top-2 font-bold tabular-nums">
                {chestNumber(chest.id)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fn-monsters" className="space-y-3">
        <h2 id="fn-monsters" className="text-xl font-bold">
          มอนสเตอร์
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {facewormNestMapData.bosses.map((b) => (
            <MonsterCard key={b.id} marker={b} mvp />
          ))}
          {facewormNestMapData.miniBosses.map((m) => (
            <MonsterCard key={m.id} marker={m} />
          ))}
        </ul>
      </section>
    </div>
  );
}
