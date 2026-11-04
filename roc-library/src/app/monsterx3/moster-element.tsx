"use client";

import React, { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ElementDot, MonsterElementLists, Stat } from "@/components/MonsterStats";
import MonstersDb from "@/services/mosters/mostersDb";
import { Monster } from "@/types/monster";
import type { MonsterX3Event } from "@/types/monsterx3";

const monsters: Monster[] = MonstersDb();

type SortKey = "exp" | "job" | "lv" | "hp";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "exp", label: "EXP" },
  { value: "job", label: "JOB" },
  { value: "lv", label: "เลเวล" },
  { value: "hp", label: "HP" },
];

const DAY = 24 * 60 * 60 * 1000;

/** Dates are shown in Thailand time whatever the visitor's clock says. */
const formatDate = (date: Date) =>
  date.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function MonsterEcomDatabase({ event }: { event: MonsterX3Event }) {
  const from = new Date(event.from);
  const to = new Date(event.to);
  const now = new Date();
  const status =
    now < from ? "upcoming" : now > to ? "ended" : ("active" as const);
  const daysLeft = Math.max(1, Math.ceil((to.getTime() - now.getTime()) / DAY));

  const [search, setSearch] = useState("");
  const [selectedRace, setSelectedRace] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("exp");
  const [descending, setDescending] = useState(true);

  // รายชื่อ ID, พื้นที่ และ EXP/JOB ปกติของงาน อยู่ใน src/data/monsterx3/main.json
  const monsterx3Ids = event.monsters.map((m) => m.id);
  const rates = new Map(event.monsters.map((m) => [m.id, m]));
  const exp3 = (m: Monster) =>
    Math.round((rates.get(m.id)?.exp ?? 0) * event.multiplier);
  const job3 = (m: Monster) =>
    Math.round((rates.get(m.id)?.job ?? 0) * event.multiplier);
  // id ที่อยู่ในงานแต่ยังไม่มีในฐานข้อมูลมอนสเตอร์ จะไม่ถูกแสดง
  const missingIds = monsterx3Ids.filter((id) => !monsters.some((m) => m.id === id));

  const eventMonsters = monsters.filter((m) => monsterx3Ids.includes(m.id));
  const maxExp = Math.max(1, ...eventMonsters.map(exp3));
  const maxJob = Math.max(1, ...eventMonsters.map(job3));

  const races = ["All", ...new Set(eventMonsters.map((m) => m.race))];
  // พื้นที่ตามประกาศของงาน เรียงตามลำดับที่ปรากฏในไฟล์
  const groups = [...new Set(event.monsters.map((m) => m.group))];
  const groupCount = (group: string) =>
    event.monsters.filter((m) => m.group === group).length;

  const sortValue = (m: Monster) =>
    sortBy === "hp" ? m.hp : sortBy === "lv" ? m.lv : sortBy === "job" ? job3(m) : exp3(m);

  const visible =
    status !== "active"
      ? []
      : eventMonsters
          .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
          .filter((m) => selectedRace === "All" || m.race === selectedRace)
          .filter(
            (m) =>
              selectedGroup === "All" || rates.get(m.id)?.group === selectedGroup,
          )
          .sort((a, b) => (descending ? 1 : -1) * (sortValue(b) - sortValue(a)));

  const filtering =
    search.trim() !== "" || selectedRace !== "All" || selectedGroup !== "All";
  const reset = () => {
    setSearch("");
    setSelectedRace("All");
    setSelectedGroup("All");
  };

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Event header: what it is, whether it is on, and until when */}
        <header className="relative overflow-hidden rounded-box border border-base-300 bg-base-100 p-5 sm:p-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-black leading-none text-accent/15 sm:text-[12rem]"
          >
            ×{event.multiplier}
          </span>
          <div className="relative">
            <span
              className={`badge ${
                status === "active"
                  ? "badge-success"
                  : status === "upcoming"
                    ? "badge-info"
                    : "badge-neutral"
              }`}
            >
              {status === "active"
                ? "กำลังจัดงาน"
                : status === "upcoming"
                  ? "ยังไม่เริ่ม"
                  : "สิ้นสุดแล้ว"}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-base-content sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-1 text-sm text-base-content/70 sm:text-base">
              EXP และ JOB x{event.multiplier} ให้มอนสเตอร์ที่กำหนด
              {" "}
              {formatDate(from)} – {formatDate(to)}
              {status === "active" && (
                <span suppressHydrationWarning>
                  {" "}
                  · เหลืออีก {daysLeft} วัน
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-base-content/70">
              ที่มา:{" "}
              <a href={event.source} target="_blank" rel="noopener noreferrer" className="underline">
                ประกาศกิจกรรม {event.title}
              </a>
            </p>
          </div>
        </header>

        {missingIds.length > 0 && (
          <div role="alert" className="alert alert-warning text-sm">
            ยังไม่มีข้อมูลสถานะในฐานข้อมูลมอนสเตอร์สำหรับ id: {missingIds.join(", ")}
          </div>
        )}

        {status !== "active" ? (
          <p className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/70">
            {status === "upcoming"
              ? `งานนี้จะเริ่มวันที่ ${formatDate(from)} กลับมาดูรายชื่อมอนสเตอร์ได้ในวันนั้น`
              : `Monster x${event.multiplier} EXP/JOB สิ้นสุดลงแล้วเมื่อวันที่ ${formatDate(to)}`}
          </p>
        ) : (
          <>
            {/* Filters: area first because it is how the event is announced */}
            <section
              aria-label="ตัวกรองและการเรียงลำดับ"
              className="space-y-3 rounded-box border border-base-300 bg-base-100 p-4"
            >
              <div
                role="group"
                aria-label="พื้นที่"
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
              >
                {["All", ...groups].map((group) => {
                  const selected = selectedGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedGroup(group)}
                      className={`btn btn-sm min-h-11 shrink-0 whitespace-nowrap ${
                        selected ? "btn-primary" : "btn-ghost border-base-300"
                      }`}
                    >
                      {group === "All" ? "ทั้งหมด" : group}
                      <span className="opacity-70">
                        {group === "All" ? event.monsters.length : groupCount(group)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
                <label className="input input-bordered flex min-h-11 w-full items-center gap-2">
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0 opacity-60" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อมอนสเตอร์"
                    aria-label="ค้นหาชื่อมอนสเตอร์"
                    className="grow"
                  />
                </label>

                <select
                  aria-label="เผ่า"
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  className="select select-bordered min-h-11 w-full"
                >
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race === "All" ? "ทุกเผ่า" : race}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                  <select
                    aria-label="เรียงตาม"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="select select-bordered min-h-11 grow"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        เรียงตาม {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDescending((d) => !d)}
                    className="btn btn-outline min-h-11 shrink-0"
                  >
                    {descending ? "มาก → น้อย" : "น้อย → มาก"}
                  </button>
                </div>
              </div>

              <p role="status" className="text-xs text-base-content/60">
                แสดง {visible.length} จาก {eventMonsters.length} ตัว
                {filtering && (
                  <button
                    type="button"
                    onClick={reset}
                    className="link link-primary ml-3 inline-flex items-center gap-1"
                  >
                    <X aria-hidden="true" className="h-3 w-3" />
                    ล้างตัวกรอง
                  </button>
                )}
              </p>
            </section>

            {visible.length === 0 ? (
              <p className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/70">
                ไม่พบมอนสเตอร์ที่ตรงกับตัวกรอง
              </p>
            ) : (
              <ul className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((m, index) => (
                  <li key={m.id}>
                    <MonsterCard
                      monster={m}
                      rank={sortBy === "exp" || sortBy === "job" ? index + 1 : undefined}
                      multiplier={event.multiplier}
                      exp={exp3(m)}
                      job={job3(m)}
                      baseExp={rates.get(m.id)?.exp ?? 0}
                      baseJob={rates.get(m.id)?.job ?? 0}
                      expShare={exp3(m) / maxExp}
                      jobShare={job3(m) / maxJob}
                      group={rates.get(m.id)?.group}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// --- Card ---

interface MonsterCardProps {
  monster: Monster;
  rank?: number;
  multiplier: number;
  exp: number;
  job: number;
  baseExp: number;
  baseJob: number;
  /** 0–1: how this monster's value compares with the best of the event. */
  expShare: number;
  jobShare: number;
  group?: string;
}

function MonsterCard({
  monster: m,
  rank,
  multiplier,
  exp,
  job,
  baseExp,
  baseJob,
  expShare,
  jobShare,
  group,
}: MonsterCardProps) {
  const [open, setOpen] = useState(false);
  const detailsId = `monster-${m.id}-details`;

  return (
    <article className="flex flex-col rounded-box border border-base-300 bg-base-100 p-4 transition-shadow hover:shadow-md">
      {/* The picture gets the full width of the card. A fixed-height flex box makes a tall
          sprite shrink to fit instead of spilling over the numbers below. */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-field bg-base-200 p-3 sm:h-52">
        {rank !== undefined && (
          <span className="absolute left-3 top-2 text-xs font-bold tabular-nums text-base-content/50">
            #{rank}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.image}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="mt-3">
        <h2 className="truncate text-xl font-bold text-base-content">{m.name}</h2>
        <p className="text-sm text-base-content/70">
          Lv {m.lv} · {m.race} · {m.scale}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1.5">
            <ElementDot element={m.property.split(" ")[0]} />
            {m.property}
          </span>
          {group && <span>{group}</span>}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <Reward
          label={`EXP ×${multiplier}`}
          value={exp}
          base={baseExp}
          share={expShare}
          badge="badge-primary"
          bar="bg-primary"
        />
        <Reward
          label={`JOB ×${multiplier}`}
          value={job}
          base={baseJob}
          share={jobShare}
          badge="badge-accent"
          bar="bg-accent"
        />
      </dl>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="btn btn-ghost btn-sm mt-3 min-h-11 justify-between border-base-300"
      >
        {open ? "ซ่อนรายละเอียด" : "รายละเอียดสถานะ"}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id={detailsId} className="mt-3 space-y-3 border-t border-base-300 pt-3">
          <dl className="grid grid-cols-4 gap-2 text-center">
            <Stat label="HP" value={m.hp.toLocaleString()} />
            <Stat label="DEF" value={m.def} />
            <Stat label="MDEF" value={m.mdef} />
            <Stat label="HIT" value={m.hit} />
          </dl>
          <MonsterElementLists element={m.element} />
        </div>
      )}
    </article>
  );
}

function Reward({
  label,
  value,
  base,
  share,
  badge,
  bar,
}: {
  label: string;
  value: number;
  base: number;
  share: number;
  badge: string;
  bar: string;
}) {
  return (
    <div className="min-w-0">
      <dt>
        <span className={`badge badge-sm font-bold ${badge}`}>{label}</span>
      </dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums text-base-content">
        {value.toLocaleString()}
      </dd>
      <dd className="text-xs text-base-content/60 tabular-nums">
        ปกติ {base.toLocaleString()}
      </dd>
      {/* The bar compares with the best of the event; the numbers above carry the information. */}
      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-200">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.max(4, Math.round(share * 100))}%` }}
        />
      </div>
    </div>
  );
}
