"use client";

import React, { useState } from "react";
import Image from "next/image";
import MonstersDb from "@/services/mosters/mostersDb";
import type { ElementMonster, Monster } from "@/types/monster";

const monsterDbMap: Record<number, Monster> = MonstersDb().reduce(
  (acc, monster) => {
    acc[monster.id] = monster;
    return acc;
  },
  {} as Record<number, Monster>,
);

interface BossFloor {
  floor: number;
  bosses: {
    name: string;
    monsterIds: number[];
  }[];
}

const floorData1to100: BossFloor[] = [
  { floor: 5, bosses: [{ name: "Mistress", monsterIds: [1059] }] },
  { floor: 10, bosses: [{ name: "Doppelganger", monsterIds: [1046] }] },
  {
    floor: 15,
    bosses: [
      { name: "Eddga", monsterIds: [1115] },
      { name: "Orc Lord", monsterIds: [1190] },
    ],
  },
  { floor: 20, bosses: [{ name: "Orc Hero", monsterIds: [1087] }] },
  { floor: 25, bosses: [{ name: "Lord of the Dead", monsterIds: [1373] }] },
  { floor: 30, bosses: [{ name: "Dracula", monsterIds: [1389] }] },
  { floor: 35, bosses: [{ name: "Turtle General", monsterIds: [1312] }] },
  { floor: 40, bosses: [{ name: "Lady Tanee", monsterIds: [1688] }] },
  { floor: 45, bosses: [{ name: "Drake", monsterIds: [1112] }] },
  {
    floor: 50,
    bosses: [
      { name: "White Lady", monsterIds: [1630] },
      { name: "Evil Snake Lord", monsterIds: [1418] },
    ],
  },
  {
    floor: 55,
    bosses: [
      { name: "Stormy Knight", monsterIds: [1251] },
      { name: "Garm", monsterIds: [1252] },
    ],
  },
  {
    floor: 60,
    bosses: [{ name: "Tao Gunka", monsterIds: [1583] }],
  },
  { floor: 65, bosses: [{ name: "Valkyrie Randgris", monsterIds: [1751] }] },
  {
    floor: 70,
    bosses: [
      { name: "Dark Lord", monsterIds: [1272] },
      { name: "Baphomet", monsterIds: [1039] },
    ],
  },
  { floor: 75, bosses: [{ name: "Nightmare Amon Ra", monsterIds: [2362] }] },
  { floor: 80, bosses: [{ name: "Gloom Under Night", monsterIds: [1768] }] },
  { floor: 85, bosses: [{ name: "Thanatos Phantom", monsterIds: [1708] }] },
  { floor: 90, bosses: [{ name: "Golden Thief Bug", monsterIds: [1086] }] },
  { floor: 95, bosses: [{ name: "Fallen Bishop", monsterIds: [1871] }] },
  { floor: 100, bosses: [{ name: "Entweihen Crothen", monsterIds: [1957] }] },
];

// Floor 101-200 dataset kept for when the enhanced-tier tab switch is re-enabled
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const floorData101to200: BossFloor[] = [
  { floor: 105, bosses: [{ name: "Mistress", monsterIds: [1150] }] },
  { floor: 110, bosses: [{ name: "Golden Thief Bug", monsterIds: [1086] }] },
  { floor: 115, bosses: [{ name: "Ifrit", monsterIds: [1832] }] },
  { floor: 120, bosses: [{ name: "Gloom Under Night", monsterIds: [1768] }] },
  { floor: 125, bosses: [{ name: "Ktullanux", monsterIds: [1719] }] },
  {
    floor: 130,
    bosses: [
      { name: "Dark Lord", monsterIds: [1272] },
      { name: "Baphomet", monsterIds: [1039] },
    ],
  },
  { floor: 135, bosses: [{ name: "Valkyrie Randgris", monsterIds: [1765] }] },
  { floor: 140, bosses: [{ name: "Vesper", monsterIds: [1734] }] },
  {
    floor: 145,
    bosses: [
      { name: "Stormy Knight", monsterIds: [1251] },
      { name: "Garm", monsterIds: [1252] },
    ],
  },
  {
    floor: 150,
    bosses: [
      { name: "White Lady", monsterIds: [1630] },
      { name: "Evil Snake Lord", monsterIds: [1708] },
    ],
  },
  { floor: 155, bosses: [{ name: "Gopinich", monsterIds: [1184] }] },
  { floor: 160, bosses: [{ name: "Osiris", monsterIds: [1038] }] },
  { floor: 165, bosses: [{ name: "Turtle General", monsterIds: [1259] }] },
  { floor: 170, bosses: [{ name: "Dracula", monsterIds: [1399] }] },
  { floor: 175, bosses: [{ name: "Lord of the Dead", monsterIds: [1373] }] },
  { floor: 180, bosses: [{ name: "Orc Hero", monsterIds: [1087] }] },
  {
    floor: 185,
    bosses: [
      { name: "Eddga", monsterIds: [1023] },
      { name: "Detardeurus", monsterIds: [1869] },
    ],
  },
  { floor: 190, bosses: [{ name: "Doppelganger", monsterIds: [1671] }] },
  { floor: 195, bosses: [{ name: "Fallen Bishop", monsterIds: [1874] }] },
  { floor: 200, bosses: [{ name: "Naght Sieger", monsterIds: [1956] }] },
];

const specialMVPs = [
  { name: "Naght Sieger", monsterId: 1956 },
  { name: "Wounded Morocc", monsterId: 1917 },
  { name: "Beelzebub", monsterId: 1874 },
  { name: "Kathryne Keyron", monsterId: 1639 },
];

function MonsterImage({
  monsterId,
  name,
  size = 56,
}: {
  monsterId: number;
  name: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-base-200 flex items-center justify-center text-xs text-base-content/40 border border-base-300"
      >
        ?
      </div>
    );
  }
  return (
    <Image
      src={`/assets/images/monsterDb/${monsterId}.gif`}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      onError={() => setImgError(true)}
      unoptimized
    />
  );
}

const ELEMENT_COLOR: Record<string, string> = {
  fire: "text-red-500",
  water: "text-blue-400",
  wind: "text-yellow-400",
  earth: "text-orange-500",
  holy: "text-yellow-100",
  shadow: "text-purple-400",
  ghost: "text-cyan-300",
  undead: "text-emerald-500",
  neutral: "text-gray-400",
  poison: "text-purple-300",
};

// Sort from highest damage taken (weakness) to lowest (resistance), dropping the neutral 100% entries
function getElementList(element?: ElementMonster) {
  if (!element) return [] as [string, number][];
  return (Object.entries(element) as [string, number][])
    .filter(([, val]) => val !== 100)
    .sort((a, b) => b[1] - a[1]);
}

function getElementBorderClass(val: number) {
  if (val > 100) return "border-green-500/50";
  if (val === 100) return "border-gray-700/50";
  if (val < 0) return "border-red-500/50";
  return "border-gray-200/50";
}

function getElementBgClass(val: number) {
  if (val > 100) return "bg-green-950/40";
  if (val === 100) return "bg-gray-800/40";
  if (val < 0) return "bg-red-950/40";
  return "bg-gray-200/10";
}

function ElementBadge({ el, val }: { el: string; val: number }) {
  const isWeak = val > 100;
  return (
    <div
      className={`flex flex-col items-center rounded-lg px-3 py-2 min-w-16 border ${getElementBorderClass(val)} ${getElementBgClass(val)}`}
      title={`Takes ${val}% damage from ${el}`}
    >
      <span
        className={`text-xs font-black uppercase ${ELEMENT_COLOR[el] ?? "text-gray-400"}`}
      >
        {el}
      </span>
      <span
        className={`text-base font-black ${isWeak ? "text-red-400" : "text-green-400"}`}
      >
        {val}%
      </span>
    </div>
  );
}

function MonsterCard({
  monsterId,
  fallbackName,
  danger,
}: {
  monsterId: number;
  fallbackName: string;
  danger?: boolean;
}) {
  const monster = monsterDbMap[monsterId];
  const name = monster?.name ?? fallbackName;
  const elements = getElementList(monster?.element);

  return (
    <div
      className={`shrink-0 w-lg rounded-2xl border p-4 grid grid-cols-2 gap-4 transition-all
        ${
          danger
            ? "border-red-700/40 bg-red-950/20 hover:border-red-500/60"
            : "border-white/10 bg-black/20 hover:border-primary/50"
        }`}
    >
      {/* Col 1: Image, Name, Details */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-36 h-36 shrink-0 rounded-xl bg-black/30 flex items-center justify-center border border-white/10">
          <MonsterImage monsterId={monsterId} name={name} size={132} />
        </div>
        <p className="text-lg font-bold text-white leading-tight">{name}</p>
        {monster ? (
          <div className="w-full text-sm text-white/60 space-y-1">
            <p>Lv. {monster.lv}</p>
            <p>{monster.race}</p>
            <p className="text-red-400 font-black text-base">
              HP {monster.hp.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-3 pt-1 text-xs">
              <span className="text-green-400 font-bold">
                HIT {monster.hit}
              </span>
              <span className="text-sky-400 font-bold">
                DEF {monster.def}
              </span>
              <span className="text-indigo-400 font-bold">
                MDEF {monster.mdef}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30">ID {monsterId}</p>
        )}
      </div>

      {/* Col 2: Element Table */}
      <div className="border-l border-white/10 pl-4 flex flex-col justify-center">
        {elements.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {elements.map(([el, val]) => (
              <ElementBadge key={el} el={el} val={val} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/30 italic">
            No element data
          </p>
        )}
      </div>
    </div>
  );
}

function FloorRow({ data, enhanced }: { data: BossFloor; enhanced?: boolean }) {
  const isLast = data.floor === 100 || data.floor === 200;
  return (
    <div
      className={`flex items-stretch gap-3 px-4 py-3 rounded-lg border transition-all
        ${
          isLast
            ? "border-yellow-400 bg-yellow-400/10 shadow-md shadow-yellow-400/20"
            : enhanced
              ? "border-red-700/40 bg-red-950/30"
              : "border-base-content/10 bg-base-100/5 hover:bg-base-content/5"
        }`}
    >
      {/* Floor Badge */}
      <div
        className={`shrink-0 self-center min-w-14 text-center font-bold text-sm rounded-md py-1 px-2
          ${
            isLast
              ? "bg-yellow-400 text-base-content"
              : enhanced
                ? "bg-red-700 text-white"
                : "bg-primary text-primary-content"
          }`}
      >
        ชั้น {data.floor}
      </div>

      {/* Monsters — single row, scrollable */}
      <div className="flex items-center gap-3 flex-1 overflow-x-auto pb-1">
        {data.bosses.flatMap((boss) =>
          boss.monsterIds.map((id) => (
            <MonsterCard
              key={id}
              monsterId={id}
              fallbackName={boss.name}
              danger={enhanced}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default function EndlessTowerPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(160deg, #0a0a1a 0%, #12082a 40%, #1a0a14 100%)",
      }}
    >
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #8B0000 0px, #8B0000 1px, transparent 1px, transparent 10px)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 text-center">
          <h1
            className="text-5xl sm:text-6xl font-black tracking-widest uppercase mb-2"
            style={{
              color: "#FFD700",
              textShadow:
                "0 0 20px #FFD700, 0 0 40px #FF8C00, 2px 2px 0 #8B0000",
              letterSpacing: "0.15em",
            }}
          >
            Endless
          </h1>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-widest uppercase"
            style={{
              color: "#FFD700",
              textShadow:
                "0 0 20px #FFD700, 0 0 40px #FF8C00, 2px 2px 0 #8B0000",
              letterSpacing: "0.15em",
            }}
          >
            Tower
          </h1>
          <p className="mt-4 text-gray-400 text-sm tracking-widest uppercase">
            Ragnarok Online Classic
          </p>
          <div className="mt-6 flex gap-2">
            <span className="badge badge-error badge-outline text-xs">
              Instance Dungeon
            </span>
            <span className="badge badge-warning badge-outline text-xs">
              Max Floor 200
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-8">
        {/* Special Floor Section */}
        <div
          className="rounded-2xl border border-yellow-500/40 overflow-hidden shadow-xl shadow-yellow-500/10"
          style={{ background: "rgba(20, 10, 40, 0.85)" }}
        >
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-4">
            <h2 className="text-lg font-bold text-yellow-400 tracking-widest uppercase text-center">
              ⭐ Special Floor — Random MVP ⭐
            </h2>
            <p className="text-center text-xs text-yellow-200/60 mt-1">
              ชั้นพิเศษที่จะสุ่ม MVP เหล่านี้
            </p>
          </div>
          <div className="p-4 flex items-center gap-3 overflow-x-auto">
            {specialMVPs.map(
              (mvp) =>
                mvp.monsterId && (
                  <MonsterCard
                    key={mvp.name}
                    monsterId={mvp.monsterId}
                    fallbackName={mvp.name}
                  />
                ),
            )}
          </div>
        </div>

        {/* Tab Switch — 101-200 disabled for now, only showing floor 1-100 */}
        {/* <div className="flex rounded-xl overflow-hidden border border-white/10">
          <button
            onClick={() => setActiveTab("1-100")}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all ${
              activeTab === "1-100"
                ? "bg-primary text-primary-content shadow-inner"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            ชั้น 1 – 100
          </button>
          <button
            onClick={() => setActiveTab("101-200")}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all ${
              activeTab === "101-200"
                ? "bg-red-700 text-white shadow-inner"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            ชั้น 101 – 200 🔥
          </button>
        </div> */}

        {/* Floor List */}
        <div
          className="rounded-2xl border border-white/10 overflow-hidden shadow-xl"
          style={{ background: "rgba(20, 10, 40, 0.85)" }}
        >
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white tracking-widest uppercase">
              👑 List BOSS MVP — ชั้น 1–100
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {floorData1to100.map((row) => (
              <FloorRow key={row.floor} data={row} enhanced={false} />
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-gray-500 pb-4 space-y-1">
          <p>* BOSS จะ Spawn ทุกๆ 5 ชั้น</p>
          <p>* ชั้น 101-200 เป็น Enhanced Version ของ BOSS ชั้น 1-100</p>
        </div>
      </div>
    </div>
  );
}
