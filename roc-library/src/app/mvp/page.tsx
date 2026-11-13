"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock, Route as RouteIcon, Search, Skull, Trash2, X } from "lucide-react";
import MonstersDb from "@/services/mosters/mostersDb";
import type { MapSpawn, Monster } from "@/types/monster";
import { mapLinks, type MapLinks } from "@/utils/mapRoute";
import {
  deathMoment,
  formatCooldown,
  formatDuration,
  respawnWindow,
  thaiClock,
  thaiDayLabel,
  type RespawnStatus,
} from "@/utils/mvpRespawn";
import RouteModal from "./components/RouteModal";

const TIMES_KEY = "roc-mvp-death-times";
const TOWN_KEY = "roc-mvp-town";
const KIND_KEY = "roc-mvp-kind";
const DEFAULT_TOWN = "prontera";
const TICK_MS = 1000;

type Mvp = Monster & { mapspawn: MapSpawn[] };
type BossKind = "mvp" | "mini";

const KINDS: { id: BossKind; label: string }[] = [
  { id: "mvp", label: "MVP" },
  { id: "mini", label: "Mini Boss" },
];
/** Death time of each Spawn map, as a moment in milliseconds, by spawnKey. */
type DeathTimes = Record<string, number>;

const mvps = MonstersDb().filter((monster): monster is Mvp => !!monster.mapspawn?.length);

const spawnKey = (mvp: Mvp, spawn: MapSpawn) => `${mvp.id}:${spawn.map}`;

const STATUS_STYLE: Record<RespawnStatus, { badge: string; label: string }> = {
  waiting: { badge: "badge-info", label: "ยังไม่ถึงเวลาเกิด" },
  open: { badge: "badge-success", label: "ถึงช่วงเวลาเกิดแล้ว" },
  passed: { badge: "badge-warning", label: "เลยช่วงเวลาเกิดแล้ว" },
};

function loadTimes(): DeathTimes {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(TIMES_KEY) ?? "{}");
    if (saved && typeof saved === "object") {
      return Object.fromEntries(
        Object.entries(saved).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
      );
    }
  } catch {
    // storage unavailable or unreadable: start empty
  }
  return {};
}

function loadTown(): string {
  try {
    return localStorage.getItem(TOWN_KEY) || DEFAULT_TOWN;
  } catch {
    return DEFAULT_TOWN;
  }
}

function loadKind(): BossKind {
  try {
    return localStorage.getItem(KIND_KEY) === "mini" ? "mini" : "mvp";
  } catch {
    return "mvp";
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

const subscribeNoop = () => () => {};

// Render only on the client so the saved Death times can be read without a hydration mismatch.
export default function MvpTrackerPage() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  return mounted ? <MvpTracker /> : null;
}

function MvpTracker() {
  const [times, setTimes] = useState(loadTimes);
  const [town, setTown] = useState(loadTown);
  const [kind, setKind] = useState(loadKind);
  const [now, setNow] = useState(Date.now);
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<MapLinks>();
  const [route, setRoute] = useState<{ mvp: Mvp; spawn: MapSpawn }>();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let alive = true;
    mapLinks().then((data) => {
      if (alive) setLinks(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const updateTimes = (next: DeathTimes) => {
    setTimes(next);
    save(TIMES_KEY, JSON.stringify(next));
  };
  const setDeath = (key: string, at: number | undefined) => {
    const next = { ...times };
    if (at === undefined) delete next[key];
    else next[key] = at;
    updateTimes(next);
  };
  const chooseTown = (next: string) => {
    setTown(next);
    save(TOWN_KEY, next);
  };
  const chooseKind = (next: BossKind) => {
    setKind(next);
    save(KIND_KEY, next);
  };

  // MVPs with a Death time come first, soonest Respawn window on top; the rest keep their order.
  const soonest = (mvp: Mvp) =>
    Math.min(
      ...mvp.mapspawn.map((spawn) => {
        const death = times[spawnKey(mvp, spawn)];
        return death === undefined ? Infinity : death + spawn.cooldown[0] * 60_000;
      }),
    );
  const query = search.trim().toLowerCase();
  const ofKind = mvps.filter((mvp) => (mvp.miniBoss ? "mini" : "mvp") === kind);
  const shown = ofKind
    .filter((mvp) => !query || mvp.name.toLowerCase().includes(query))
    .map((mvp) => ({ mvp, at: soonest(mvp) }))
    .sort((a, b) => (a.at === b.at ? 0 : a.at - b.at));
  const timed = Object.keys(times).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-base-content sm:text-3xl">
          <Skull aria-hidden className="h-7 w-7 text-primary" /> MVP Hunter
        </h1>
        <p className="max-w-3xl text-base-content/70">
          ใส่เวลาที่บอสตาย (เวลาไทย) แล้วหน้านี้จะคำนวณช่วงเวลาเกิดให้ เวลาเกิดเป็นค่าโดยประมาณ
          และหน้านี้ไม่รู้ว่าบอสถูกฆ่าไปแล้วหรือยัง เวลาที่ใส่ไว้เก็บอยู่ในเครื่องของคุณเท่านั้น
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="join" role="group" aria-label="ประเภทบอส">
          {KINDS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={kind === id}
              className={`btn join-item btn-sm ${kind === id ? "btn-primary" : "btn-outline"}`}
              onClick={() => chooseKind(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="input input-bordered flex min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-base-content/60" />
          <input
            type="search"
            className="min-w-0 grow"
            placeholder="ค้นหาชื่อบอส"
            aria-label="ค้นหาชื่อบอส"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <p className="text-sm text-base-content/70">
          {shown.length} / {ofKind.length} ตัว
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm ml-auto gap-2"
          disabled={timed === 0}
          onClick={() => updateTimes({})}
        >
          <Trash2 aria-hidden className="h-4 w-4" /> ล้างเวลาทั้งหมด
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="py-12 text-center text-base-content/70">ไม่พบบอสชื่อ “{search.trim()}”</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {shown.map(({ mvp }) => (
            <li key={mvp.id} className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mvp.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-base-content">{mvp.name}</h2>
                  <p className="text-sm text-base-content/70">
                    Lv {mvp.lv} · {mvp.race} · {mvp.property}
                  </p>
                </div>
              </div>
              <div className="mt-3 divide-y divide-base-300">
                {mvp.mapspawn.map((spawn) => (
                  <SpawnRow
                    key={spawn.map}
                    mvpName={mvp.name}
                    spawn={spawn}
                    mapName={links?.maps[spawn.map]?.name}
                    death={times[spawnKey(mvp, spawn)]}
                    now={now}
                    onDeath={(at) => setDeath(spawnKey(mvp, spawn), at)}
                    onRoute={() => setRoute({ mvp, spawn })}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {route && (
        <RouteModal
          mvpName={route.mvp.name}
          spawn={route.spawn}
          links={links}
          town={town}
          onTownChange={chooseTown}
          onClose={() => setRoute(undefined)}
        />
      )}
    </div>
  );
}

interface SpawnRowProps {
  mvpName: string;
  spawn: MapSpawn;
  mapName: string | undefined;
  death: number | undefined;
  now: number;
  onDeath: (at: number | undefined) => void;
  onRoute: () => void;
}

function SpawnRow({ mvpName, spawn, mapName, death, now, onDeath, onRoute }: SpawnRowProps) {
  const respawn = death === undefined ? undefined : respawnWindow(death, spawn.cooldown, now);
  const label = `${mvpName} ที่ ${spawn.map}`;

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-semibold text-base-content">
          {mapName ?? spawn.map}{" "}
          {mapName && <span className="font-mono text-sm font-normal text-base-content/70">({spawn.map})</span>}
        </p>
        <p className="flex items-center gap-1 text-sm text-base-content/70">
          <Clock aria-hidden className="h-4 w-4" /> เกิดใหม่ใน {formatCooldown(spawn.cooldown)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-base-content">
          เวลาตาย
          <input
            type="time"
            className="input input-bordered input-sm w-28"
            aria-label={`เวลาตายของ ${label}`}
            value={death === undefined ? "" : thaiClock(death)}
            onChange={(e) => onDeath(deathMoment(e.target.value, Date.now()))}
          />
        </label>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onDeath(Date.now())}>
          ตายตอนนี้
        </button>
        {death !== undefined && (
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            aria-label={`ล้างเวลาตายของ ${label}`}
            onClick={() => onDeath(undefined)}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
        <button type="button" className="btn btn-outline btn-sm ml-auto gap-1" onClick={onRoute}>
          <RouteIcon aria-hidden className="h-4 w-4" /> เส้นทาง
        </button>
      </div>

      {respawn && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-base-200 px-3 py-2" aria-live="off">
          <p className="text-base font-bold text-base-content">
            เกิด {thaiClock(respawn.from)}
            {respawn.to !== respawn.from && ` – ${thaiClock(respawn.to)}`}
            {thaiDayLabel(respawn.from, now) && (
              <span className="ml-1 text-sm font-normal text-base-content/70">
                ({thaiDayLabel(respawn.from, now)})
              </span>
            )}
          </p>
          <span className={`badge ${STATUS_STYLE[respawn.status].badge}`}>{STATUS_STYLE[respawn.status].label}</span>
          <p className="font-mono text-sm text-base-content/80">
            {respawn.status === "waiting" && `อีก ${formatDuration(respawn.from - now)}`}
            {respawn.status === "open" && `เหลือ ${formatDuration(respawn.to - now)}`}
            {respawn.status === "passed" && `เลยมา ${formatDuration(now - respawn.to)}`}
          </p>
        </div>
      )}
    </div>
  );
}
