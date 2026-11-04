"use client";
import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ElementDot, MonsterElementLists, Stat } from "@/components/MonsterStats";
import MonstersDb from "@/services/mosters/mostersDb";
import { Monster } from "@/types/monster";

const monsters: Monster[] = MonstersDb();

type StageType = "miniboss" | "stage1" | "stage2" | "stage3";
type SortKey = "lv" | "hp";

const STAGES: { id: StageType; label: string; monsterIds: number[] }[] = [
  {
    id: "miniboss",
    label: "Mini Boss",
    monsterIds: [1089, 1092, 1088, 1096, 1093, 1120, 1090],
  },
  {
    id: "stage1",
    label: "Stage 1",
    monsterIds: [
      1038, 1039, 1046, 1086, 1087, 1115, 1147, 1150, 1159, 1190, 1688, 2097,
      2099,
    ],
  },
  {
    id: "stage2",
    label: "Stage 2",
    monsterIds: [
      1980, 1157, 1112, 1251, 2068, 1373, 2156, 1272, 1630, 1779, 1252, 1708,
    ],
  },
  {
    id: "stage3",
    label: "Stage 3",
    monsterIds: [
      1623, 2104, 2105, 1785, 1734, 1719, 1768, 2165, 1765, 2253, 2255, 1832,
      1874,
    ],
  },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "lv", label: "เลเวล" },
  { value: "hp", label: "HP" },
];

const monstersOfStage = (stage: (typeof STAGES)[number]) =>
  monsters.filter((m) => stage.monsterIds.includes(m.id));

// The same races whichever Stage is open, so a chosen race stays valid across Stages.
const RACES = [
  "All",
  ...new Set(STAGES.flatMap(monstersOfStage).map((m) => m.race)),
];

export default function MonsterTablePage() {
  const [selectedStage, setSelectedStage] = useState<StageType>("miniboss");
  const [search, setSearch] = useState("");
  const [selectedRace, setSelectedRace] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("lv");
  const [descending, setDescending] = useState(true);

  const stage = STAGES.find((s) => s.id === selectedStage)!;
  const stageMonsters = monstersOfStage(stage);
  // id ที่อยู่ใน Stage แต่ยังไม่มีในฐานข้อมูลมอนสเตอร์ จะไม่ถูกแสดง
  const missingIds = stage.monsterIds.filter(
    (id) => !stageMonsters.some((m) => m.id === id),
  );

  const visible = stageMonsters
    .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((m) => selectedRace === "All" || m.race === selectedRace)
    .sort((a, b) => (descending ? 1 : -1) * (b[sortBy] - a[sortBy]));

  const filtering = search.trim() !== "" || selectedRace !== "All";
  const reset = () => {
    setSearch("");
    setSelectedRace("All");
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-bold text-base-content sm:text-3xl">
          มอนสเตอร์ใน Central Lab
        </h2>
        <p className="mt-1 text-sm text-base-content/70 sm:text-base">
          เลือก Stage แล้วดูเลเวล เผ่า ธาตุ และ HP ของแต่ละตัว
        </p>
      </header>

      <section
        aria-label="ตัวกรองและการเรียงลำดับ"
        className="space-y-3 rounded-box border border-base-300 bg-base-100 p-4"
      >
        <div
          role="group"
          aria-label="Stage"
          className="grid grid-cols-2 gap-2 sm:flex"
        >
          {STAGES.map((s) => {
            const selected = selectedStage === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedStage(s.id)}
                className={`btn btn-sm min-h-11 whitespace-nowrap ${
                  selected ? "btn-primary" : "btn-ghost border-base-300"
                }`}
              >
                {s.label}
                <span className="opacity-70">{monstersOfStage(s).length}</span>
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
            {RACES.map((race) => (
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
          แสดง {visible.length} จาก {stageMonsters.length} ตัว
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

      {missingIds.length > 0 && (
        <div role="alert" className="alert alert-warning text-sm">
          ยังไม่มีข้อมูลสถานะในฐานข้อมูลมอนสเตอร์สำหรับ id: {missingIds.join(", ")}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/70">
          ไม่พบมอนสเตอร์ที่ตรงกับตัวกรอง
        </p>
      ) : (
        <ul className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <li key={m.id}>
              <MonsterCard monster={m} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MonsterCard({ monster: m }: { monster: Monster }) {
  const [open, setOpen] = useState(false);
  const detailsId = `lab-monster-${m.id}-details`;

  return (
    <article className="flex flex-col rounded-box border border-base-300 bg-base-100 p-4 transition-shadow hover:shadow-md">
      {/* A fixed-height flex box makes a tall sprite shrink to fit instead of spilling over the text below. */}
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-field bg-base-200 p-3 sm:h-40">
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
        <h3 className="truncate text-xl font-bold text-base-content">{m.name}</h3>
        <p className="text-sm text-base-content/70">
          Lv {m.lv} · {m.race}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-base-content/60">
          <ElementDot element={m.property.split(" ")[0]} />
          {m.property}
        </p>
      </div>

      <dl className="mt-3 flex items-baseline justify-between gap-3 border-t border-base-300 pt-3">
        <dt className="text-sm font-semibold text-base-content/70">HP</dt>
        <dd className="text-2xl font-extrabold tabular-nums text-base-content">
          {m.hp.toLocaleString()}
        </dd>
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
          <p className="text-sm text-base-content/70">ขนาด {m.scale}</p>
          <dl className="grid grid-cols-3 gap-2 text-center">
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
