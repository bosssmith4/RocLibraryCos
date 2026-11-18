"use client";

import { Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import { calcCast, MAX_ASPD, type CastInput } from "@/utils/castCalc";

const fmt = (value: number, digits = 2) =>
  new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

type FieldDef = {
  key: keyof CastInput;
  label: string;
  hint: string;
  step: string;
  max?: number;
};

const GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Fix",
    fields: [
      { key: "fixedCast", label: "Fixed cast", hint: "วินาที", step: "0.1" },
      { key: "fixedReduction", label: "ลด Fixed cast", hint: "%", step: "1", max: 100 },
    ],
  },
  {
    title: "VCT",
    fields: [
      { key: "baseVct", label: "Base VCT", hint: "วินาที", step: "0.1" },
      { key: "dex", label: "DEX", hint: "รวมทั้งหมด", step: "1" },
      { key: "int", label: "INT", hint: "รวมทั้งหมด", step: "1" },
      { key: "gearVctReduction", label: "ลด VCT (เกียร์)", hint: "%", step: "1", max: 100 },
      { key: "skillVctReduction", label: "ลด VCT (สกิล)", hint: "%", step: "1", max: 100 },
    ],
  },
  {
    title: "Delay",
    fields: [
      { key: "afterCastDelay", label: "After-cast delay", hint: "วินาที", step: "0.1" },
      { key: "delayReduction", label: "ลด After-cast delay", hint: "%", step: "1", max: 100 },
      { key: "cooldown", label: "Cooldown", hint: "วินาที", step: "0.1" },
      { key: "cooldownReduction", label: "ลด Cooldown", hint: "%", step: "1", max: 100 },
    ],
  },
  {
    title: "ASPD",
    fields: [
      { key: "aspd", label: "ASPD", hint: `สูงสุด ${MAX_ASPD}`, step: "1", max: MAX_ASPD },
    ],
  },
];

const HOLD_SECONDS = 0.5;

const INITIAL: CastInput = {
  fixedCast: 0,
  fixedReduction: 0,
  baseVct: 1,
  dex: 0,
  int: 0,
  gearVctReduction: 0,
  skillVctReduction: 0,
  afterCastDelay: 0,
  delayReduction: 0,
  cooldown: 1,
  cooldownReduction: 0,
  aspd: 190,
};

export default function CastCalcPage() {
  const [input, setInput] = useState<CastInput>(INITIAL);
  const r = calcCast(input);

  const update = (field: FieldDef, raw: string) => {
    const n = Number(raw);
    let value = Number.isFinite(n) ? Math.max(0, n) : 0;
    if (field.max !== undefined) value = Math.min(value, field.max);
    setInput((prev) => ({ ...prev, [field.key]: value }));
  };

  const animate = r.reuse > 0;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const cycle = r.reuse + HOLD_SECONDS;
    const startedAt = performance.now();
    let frame = 0;
    const step = (now: number) => {
      setTick(Math.min(((now - startedAt) / 1000) % cycle, r.reuse));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animate, r.reuse, r.fixed, r.vct, r.delay, r.cooldown]);

  // null = static preview (no motion)
  const elapsed = animate ? tick : null;
  const scale = r.reuse > 0 ? r.reuse : 1;

  let start = 0;
  const segments = [
    { name: "Fix", value: r.fixed, color: "bg-warning" },
    { name: "VCT", value: r.vct, color: "bg-primary" },
    {
      name: r.delaySource === "skill" ? "Delay (สกิล)" : "Delay (ASPD)",
      value: r.delay,
      color: "bg-secondary",
    },
  ].map((s) => {
    const seg = { ...s, start };
    start += s.value;
    return seg;
  });

  const fillOf = (from: number, length: number) =>
    elapsed === null || length <= 0
      ? 1
      : Math.min(Math.max((elapsed - from) / length, 0), 1);

  const stage =
    elapsed === null
      ? null
      : elapsed >= r.reuse
        ? "ใช้ซ้ำได้แล้ว"
        : elapsed >= r.total
          ? "รอ Cooldown"
          : (segments.find((s) => s.value > 0 && elapsed < s.start + s.value)
              ?.name ?? "");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-base-content sm:px-6">
      <header className="border-b border-base-300 pb-5">
        <div className="flex items-center gap-3 text-primary">
          <Hourglass aria-hidden="true" className="size-6" />
          <h1 className="text-3xl font-bold">Cast Calculator</h1>
        </div>
        <p className="mt-2 text-sm opacity-70">
          คำนวณเวลาร่ายสกิล: Fixed cast + VCT + Delay จาก DEX, INT และ ASPD
        </p>
      </header>

      <section className="mt-6 rounded-box border border-base-300 bg-base-100 p-5 shadow">
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">
          Cast bar
        </h2>
        <div className="mt-3 flex items-baseline justify-between text-sm">
          <span className="font-bold text-primary">{stage ?? " "}</span>
          {elapsed !== null && (
            <span className="font-mono opacity-70">
              {fmt(elapsed)} / {fmt(r.reuse)} วิ
            </span>
          )}
        </div>
        <div className="relative mt-1 h-14 w-full overflow-hidden rounded-lg bg-base-200">
          {r.total > 0 ? (
            <div className="flex h-full w-full">
              {segments.map((s) =>
                s.value > 0 ? (
                  <div
                    key={s.name}
                    style={{ width: `${(s.value / scale) * 100}%` }}
                    className="relative min-w-0 overflow-hidden"
                    title={`${s.name} ${fmt(s.value)} วิ`}
                  >
                    <div className={`absolute inset-0 opacity-25 ${s.color}`} />
                    <div
                      className={`absolute inset-y-0 left-0 ${s.color}`}
                      style={{ width: `${fillOf(s.start, s.value) * 100}%` }}
                    />
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
              ไม่มีเวลาร่ายหรือ delay
            </div>
          )}
          {elapsed !== null && r.total > 0 && (
            <div
              className="absolute inset-y-0 w-0.5 bg-base-content"
              style={{ left: `${(elapsed / scale) * 100}%` }}
            />
          )}
        </div>
        <div className="mt-1 flex">
          {segments.map((s) =>
            s.value > 0 ? (
              <div
                key={s.name}
                style={{ width: `${(s.value / scale) * 100}%` }}
                className="min-w-0 text-center text-xs"
              >
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="block font-mono opacity-70">{fmt(s.value)}</span>
              </div>
            ) : null,
          )}
        </div>
        {r.cooldown > 0 && (
          <div className="mt-3">
            <p className="text-xs opacity-70">Cooldown {fmt(r.cooldown)} วิ</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-base-200">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${(r.cooldown / scale) * 100 * fillOf(0, r.cooldown)}%`,
                }}
              />
            </div>
          </div>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs opacity-70">เวลารวมต่อสกิล</p>
            <p className="font-mono text-4xl font-bold text-primary">
              {fmt(r.total)} <span className="text-lg">วิ</span>
            </p>
          </div>
          <div>
            <p className="text-xs opacity-70">ใช้สกิลเดิมซ้ำได้ทุก</p>
            <p className="font-mono text-4xl font-bold">
              {fmt(r.reuse)} <span className="text-lg">วิ</span>
            </p>
            <p className="text-xs opacity-70">
              {r.cooldown > r.total
                ? `Cooldown ${fmt(r.cooldown)} วิ เป็นตัวกำหนด`
                : "เวลารวมเป็นตัวกำหนด"}
            </p>
          </div>
        </div>
        <dl className="mt-4 space-y-1 border-t border-base-300 pt-3 text-sm">
          <Row k="ตัวคูณ DEX/INT" v={fmt(r.statMultiplier, 4)} />
          <Row k="ASPD delay (200 − ASPD) / 50" v={`${fmt(r.aspdDelay)} วิ`} />
          <Row k="After-cast delay หลังลด" v={`${fmt(r.skillDelay)} วิ`} />
          <Row
            k="Delay ที่ใช้"
            v={`${fmt(r.delay)} วิ (${r.delaySource === "skill" ? "สกิลเป็นตัวกำหนด" : "ASPD เป็นตัวกำหนด"})`}
          />
        </dl>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <section
            key={g.title}
            className="rounded-box border border-base-300 bg-base-100 p-5"
          >
            <h2 className="text-base font-bold text-primary">{g.title}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {g.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="block text-sm font-semibold">{f.label}</span>
                  <span className="block text-xs opacity-60">{f.hint}</span>
                  <input
                    type="number"
                    min="0"
                    max={f.max}
                    step={f.step}
                    value={input[f.key]}
                    onChange={(e) => update(f, e.target.value)}
                    className="input input-bordered mt-1 w-full font-mono"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 rounded-box border border-base-300 bg-base-200 p-4 font-mono text-xs leading-6">
        <p>Fix = Fixed cast × (1 − %ลด)</p>
        <p>VCT = BaseVCT × (1 − √((DEX×2 + INT) / 530)) × (1 − %เกียร์) × (1 − %สกิล)</p>
        <p>Delay = max(After-cast delay × (1 − %ลด), (200 − ASPD) / 50)</p>
        <p>รวม = Fix + VCT + Delay · ใช้ซ้ำได้ = max(รวม, Cooldown × (1 − %ลด))</p>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="opacity-70">{k}</dt>
      <dd className="font-mono font-semibold">{v}</dd>
    </div>
  );
}
