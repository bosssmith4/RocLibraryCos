"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, Clock, RotateCcw, Route as RouteIcon, Search, Skull, Trash2, X } from "lucide-react";
import { MonsterElementLists, Stat } from "@/components/MonsterStats";
import MonstersDb from "@/services/mosters/mostersDb";
import type { MapSpawn, Monster } from "@/types/monster";
import { mapLinks, type MapLinks } from "@/utils/mapRoute";
import {
  deathMoment,
  formatCooldown,
  formatDuration,
  respawnsAtOnce,
  respawnWindow,
  thaiClock,
  thaiDayLabel,
  type RespawnStatus,
  type RespawnWindow,
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

const STATUS_STYLE: Record<RespawnStatus, { badge: string; label: string; row: string }> = {
  waiting: { badge: "badge-info", label: "ยังไม่ถึงเวลาเกิด", row: "" },
  open: { badge: "badge-success", label: "ถึงช่วงเวลาเกิดแล้ว", row: "bg-success/10" },
  passed: { badge: "badge-warning", label: "เลยช่วงเวลาเกิดแล้ว", row: "bg-warning/10" },
};

const HOW_TO = ["หาบอสในรายการด้านล่าง", "พิมพ์เวลาที่บอสตายในช่อง “บอสตายตอน” เช่น 23:40", "ช่วงเวลาเกิดและตัวนับถอยหลังจะขึ้นตรงนี้"];

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
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
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

  // Every Spawn map being timed, whichever kind of boss it is, soonest Respawn window on top.
  const tracked = mvps
    .flatMap((mvp) =>
      mvp.mapspawn.flatMap((spawn) => {
        const death = times[spawnKey(mvp, spawn)];
        if (death === undefined || respawnsAtOnce(spawn.cooldown)) return [];
        return [{ mvp, spawn, respawn: respawnWindow(death, spawn.cooldown, now) }];
      }),
    )
    .sort((a, b) => a.respawn.from - b.respawn.from);

  const query = search.trim().toLowerCase();
  const ofKind = (id: BossKind) => mvps.filter((mvp) => (mvp.miniBoss ? "mini" : "mvp") === id);
  const shown = ofKind(kind).filter((mvp) => !query || mvp.name.toLowerCase().includes(query));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-base-content sm:text-3xl">
          <Skull aria-hidden className="h-7 w-7 text-primary" /> MVP Hunter
        </h1>
        <p className="text-base-content/70">จับเวลาเกิดของบอส และดูเส้นทางไปแมพที่บอสเกิด</p>
      </header>

      <section
        aria-labelledby="mvp-tracked-title"
        className="rounded-xl border-2 border-primary/40 bg-base-100 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-base-300 px-4 py-3">
          <h2 id="mvp-tracked-title" className="flex items-center gap-2 text-lg font-bold text-base-content">
            <Clock aria-hidden className="h-5 w-5 text-primary" /> กำลังจับเวลา
            {tracked.length > 0 && <span className="badge badge-primary">{tracked.length}</span>}
          </h2>
          {tracked.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm ml-auto gap-2" onClick={() => updateTimes({})}>
              <Trash2 aria-hidden className="h-4 w-4" /> ล้างเวลาทั้งหมด
            </button>
          )}
        </div>

        {tracked.length === 0 ? (
          <div className="space-y-3 p-4">
            <p className="font-semibold text-base-content">ยังไม่ได้จับเวลาบอสตัวไหน เริ่มได้ใน 3 ขั้น</p>
            <ol className="grid gap-3 sm:grid-cols-3">
              {HOW_TO.map((step, i) => (
                <li key={step} className="flex items-start gap-3 rounded-lg bg-base-200 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                    {i + 1}
                  </span>
                  <span className="text-sm text-base-content">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <ul className="divide-y divide-base-300">
            {tracked.map(({ mvp, spawn, respawn }) => (
              <TrackedRow
                key={spawnKey(mvp, spawn)}
                mvp={mvp}
                spawn={spawn}
                mapName={links?.maps[spawn.map]?.name}
                respawn={respawn}
                now={now}
                onDeath={(at) => setDeath(spawnKey(mvp, spawn), at)}
                onRoute={() => setRoute({ mvp, spawn })}
              />
            ))}
          </ul>
        )}
        <p className="border-t border-base-300 px-4 py-2 text-xs text-base-content/70">
          เวลาเกิดเป็นค่าโดยประมาณ (เวลาไทย) หน้านี้ไม่รู้ว่าบอสถูกฆ่าไปแล้วหรือยัง และเวลาที่จับไว้เก็บอยู่ในเครื่องของคุณเท่านั้น
        </p>
      </section>

      <section aria-labelledby="mvp-list-title" className="space-y-4">
        <h2 id="mvp-list-title" className="text-lg font-bold text-base-content">
          บอสทั้งหมด
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="join" role="group" aria-label="ประเภทบอส">
            {KINDS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={kind === id}
                className={`btn join-item min-h-11 gap-2 ${kind === id ? "btn-primary" : "btn-outline"}`}
                onClick={() => chooseKind(id)}
              >
                {label}
                <span className="font-normal opacity-80">{ofKind(id).length}</span>
              </button>
            ))}
          </div>
          <label className="input input-bordered flex min-h-11 min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
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
          {query && (
            <p role="status" className="text-sm text-base-content/70">
              พบ {shown.length} ตัว
            </p>
          )}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-base-300 bg-base-100 py-12 text-center text-base-content/70">
            ไม่พบบอสชื่อ “{search.trim()}”
          </p>
        ) : (
          <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {shown.map((mvp) => (
              <li key={mvp.id} className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <BossHeader mvp={mvp} />
                <div className="mt-3 divide-y divide-base-300 border-t border-base-300 pt-3">
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
      </section>

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

function Sprite({ src, size }: { src: string; size: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-200 ${size}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
    </div>
  );
}

/** "14:05 – 14:15", with "(พรุ่งนี้)" and the like when that is not today. */
function WindowClock({ respawn, now }: { respawn: RespawnWindow; now: number }) {
  const day = thaiDayLabel(respawn.from, now);
  return (
    <>
      {thaiClock(respawn.from)}
      {respawn.to !== respawn.from && ` – ${thaiClock(respawn.to)}`}
      {day && <span className="ml-1 text-sm font-normal text-base-content/70">({day})</span>}
    </>
  );
}

const countdown = (respawn: RespawnWindow, now: number) =>
  respawn.status === "waiting"
    ? `อีก ${formatDuration(respawn.from - now)}`
    : respawn.status === "open"
      ? `เหลือ ${formatDuration(respawn.to - now)}`
      : `เลยมา ${formatDuration(now - respawn.to)}`;

interface TrackedRowProps {
  mvp: Mvp;
  spawn: MapSpawn;
  mapName: string | undefined;
  respawn: RespawnWindow;
  now: number;
  onDeath: (at: number | undefined) => void;
  onRoute: () => void;
}

function TrackedRow({ mvp, spawn, mapName, respawn, now, onDeath, onRoute }: TrackedRowProps) {
  const status = STATUS_STYLE[respawn.status];
  const label = `${mvp.name} ที่ ${spawn.map}`;
  return (
    <li className={`flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 ${status.row}`}>
      <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
        <Sprite src={mvp.image} size="h-20 w-20" />
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-base-content">{mvp.name}</p>
          <p className="truncate text-sm text-base-content/70">{mapName ?? spawn.map}</p>
        </div>
      </div>
      <div className="flex-1 basis-32 sm:flex-none sm:basis-40">
        <p className="text-xs text-base-content/70">ช่วงเวลาเกิด</p>
        <p className="text-xl font-bold tabular-nums text-base-content">
          <WindowClock respawn={respawn} now={now} />
        </p>
      </div>
      <div className="flex-1 basis-32 sm:flex-none sm:basis-44">
        <span className={`badge badge-sm ${status.badge}`}>{status.label}</span>
        <p className="font-mono text-xl font-bold tabular-nums text-base-content">{countdown(respawn, now)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-10 gap-1 border-base-300"
          aria-label={`${label} เพิ่งตายตอนนี้ เริ่มจับเวลาใหม่`}
          onClick={() => onDeath(Date.now())}
        >
          <RotateCcw aria-hidden className="h-4 w-4" /> ตายตอนนี้
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm min-h-10 gap-1"
          aria-label={`เส้นทางไปหา ${label}`}
          onClick={onRoute}
        >
          <RouteIcon aria-hidden className="h-4 w-4" /> เส้นทาง
        </button>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm"
          aria-label={`เลิกจับเวลา ${label}`}
          title="เลิกจับเวลา"
          onClick={() => onDeath(undefined)}
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function BossHeader({ mvp }: { mvp: Mvp }) {
  const [open, setOpen] = useState(false);
  const detailsId = `mvp-${mvp.id}-details`;

  return (
    <>
      <div className="flex items-center gap-3">
        <Sprite src={mvp.image} size="h-24 w-24 sm:h-28 sm:w-28" />
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold leading-tight text-base-content">{mvp.name}</h3>
          <p className="text-sm text-base-content/70">
            Lv {mvp.lv} · {mvp.race} · {mvp.property}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-10 shrink-0 gap-1 border-base-300"
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`สถานะของ ${mvp.name}`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "ซ่อนสถานะ" : "ดูสถานะ"}
          <ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div id={detailsId} className="mt-3 space-y-3 rounded-lg border border-base-300 p-3">
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-base-content/70">
            <span>ขนาด {mvp.scale}</span>
            <span>
              HP <span className="text-lg font-bold tabular-nums text-base-content">{mvp.hp.toLocaleString()}</span>
            </span>
          </p>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label="DEF" value={mvp.def} />
            <Stat label="MDEF" value={mvp.mdef} />
            <Stat label="HIT" value={mvp.hit} />
          </dl>
          <MonsterElementLists element={mvp.element} />
        </div>
      )}
    </>
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
  // nothing to time when the boss is back within seconds
  const atOnce = respawnsAtOnce(spawn.cooldown);
  const respawn = death === undefined || atOnce ? undefined : respawnWindow(death, spawn.cooldown, now);
  const label = `${mvpName} ที่ ${spawn.map}`;

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-44">
          <p className="font-semibold text-base-content">
            {mapName ?? spawn.map}{" "}
            {mapName && <span className="font-mono text-sm font-normal text-base-content/70">({spawn.map})</span>}
          </p>
          <p className="flex items-center gap-1 text-sm text-base-content/70">
            <Clock aria-hidden className="h-4 w-4 shrink-0" />
            {atOnce ? "เกิดใหม่ทันที ไม่ต้องจับเวลา" : `เกิดใหม่ใน ${formatCooldown(spawn.cooldown)}`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm min-h-10 gap-1"
          aria-label={`เส้นทางไปหา ${label}`}
          onClick={onRoute}
        >
          <RouteIcon aria-hidden className="h-4 w-4" /> เส้นทาง
        </button>
      </div>

      {!atOnce && (
        <div
          className={`flex items-start gap-2 rounded-lg px-3 py-3 ${
            respawn ? STATUS_STYLE[respawn.status].row || "bg-base-200" : "bg-base-200"
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
            {/* remounts when the Death time changes elsewhere, so the box always shows the saved time */}
            <DeathTimeField key={death ?? "none"} label={label} death={death} onDeath={onDeath} />
            {respawn && (
              <div>
                <p className="flex flex-wrap items-center gap-x-2 text-lg font-bold tabular-nums text-base-content">
                  <span>
                    เกิด <WindowClock respawn={respawn} now={now} />
                  </span>
                  <span className={`badge badge-sm ${STATUS_STYLE[respawn.status].badge}`}>
                    {STATUS_STYLE[respawn.status].label}
                  </span>
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums text-base-content">
                  {countdown(respawn, now)}
                </p>
              </div>
            )}
          </div>
          {respawn && (
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm shrink-0"
              aria-label={`เลิกจับเวลา ${label}`}
              title="เลิกจับเวลา"
              onClick={() => onDeath(undefined)}
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Thai and Arabic-Indic digits count too, so a Thai keyboard layout never gets in the way
const DIGIT_VALUE: Record<string, string> = Object.fromEntries(
  ["๐๑๒๓๔๕๖๗๘๙", "٠١٢٣٤٥٦٧٨٩"].flatMap((set) => [...set].map((ch, i) => [ch, String(i)])),
);
const digitsOf = (text: string) =>
  [...text]
    .map((ch) => (/\d/.test(ch) ? ch : (DIGIT_VALUE[ch] ?? "")))
    .join("")
    .slice(0, 4);

/** Up to four digits as a clock being typed: "2" "23:" "23:4" "23:40"; a first digit above 2 can only be an hour like 09. */
function maskClock(digits: string, closing: boolean): string {
  const d = digits[0] > "2" ? "0" + digits : digits;
  if (d.length < 2) return d;
  return d.length === 2 && !closing ? d + ":" : d.length === 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** "23:40" or "24:00" (midnight, as "00:00") from a finished mask; undefined when it is not a time of day. */
function finishedClock(mask: string): string | undefined {
  const match = mask.match(/^(\d{2}):?(\d{2})?$/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes > 0)) return undefined;
  return `${String(hours % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

interface DeathTimeFieldProps {
  label: string;
  death: number | undefined;
  onDeath: (at: number | undefined) => void;
}

/** The Death time typed by hand (Thailand time, 24 hours, 24:00 allowed), with "ตอนนี้" as the shortcut. */
function DeathTimeField({ label, death, onDeath }: DeathTimeFieldProps) {
  const saved = death === undefined ? "" : thaiClock(death);
  const [text, setText] = useState(saved);
  const [invalid, setInvalid] = useState(false);

  const commit = (mask: string) => {
    const clock = finishedClock(mask);
    if (!clock) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setText(clock);
    onDeath(deathMoment(clock, Date.now()));
  };

  // only a complete time (4 digits) is taken straight away; fewer digits wait for Enter or leaving the box
  const change = (digits: string, deleting: boolean) => {
    const mask = maskClock(digits, deleting);
    setText(mask);
    setInvalid(false);
    if (digits.length === 4 && mask.length === 5) commit(mask);
  };

  const finish = () => {
    if (text.trim() === "" || text === saved) {
      setText(saved);
      setInvalid(false);
    } else if (text.length < 5 && text.replace(":", "").length !== 2) {
      setInvalid(true);
    } else commit(text);
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 whitespace-nowrap text-sm font-semibold text-base-content sm:flex-row sm:items-center sm:gap-2">
          บอสตายตอน
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={5}
            placeholder="เช่น 23:40"
            className={`input input-bordered min-h-11 w-32 text-center font-mono text-lg font-bold tabular-nums placeholder:text-sm placeholder:font-normal ${
              invalid ? "input-error" : "input-primary"
            }`}
            aria-label={`เวลาที่ ${label} ตาย (เวลาไทย 24 ชั่วโมง)`}
            aria-invalid={invalid}
            value={text}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => change(digitsOf(e.target.value), e.target.value.length < text.length)}
            onKeyDown={(e) => {
              if (e.key === "Enter") finish();
              // a Thai layout types Thai letters on the number row: read the physical key instead
              const key = e.code.match(/^(?:Digit|Numpad)(\d)$/);
              if (!key || e.ctrlKey || e.metaKey || e.altKey || /^\d$/.test(e.key)) return;
              e.preventDefault();
              const input = e.currentTarget;
              const all = input.selectionStart === 0 && input.selectionEnd === input.value.length;
              change(digitsOf((all ? "" : digitsOf(text)) + key[1]), false);
            }}
            onBlur={finish}
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-10 border-base-300"
          aria-label={`${label} เพิ่งตายตอนนี้`}
          onClick={() => onDeath(Date.now())}
        >
          ตอนนี้
        </button>
      </div>
      {invalid && (
        <p role="alert" className="mt-1 text-xs text-error">
          ใส่เป็น ชั่วโมง:นาที แบบ 24 ชั่วโมง เช่น 23:40 (00:00 หรือ 24:00 คือเที่ยงคืน)
        </p>
      )}
    </div>
  );
}
