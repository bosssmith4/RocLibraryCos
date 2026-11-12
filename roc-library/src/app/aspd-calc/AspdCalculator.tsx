"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import {
  CLASS_TIERS,
  FAMILIES,
  JOBS,
  POTIONS,
  TIER_ORDER,
  WEAPONS,
  offHandWeapons,
} from "@/data/aspdData";
import { attacksPerSecond, calcASPD, stepsToASPD } from "@/utils/aspdFormula";
import type { AspdInput, JobEntry, JobFamily, OffHandSelection } from "./types";
import { Dropdown } from "./components/Dropdown";
import type { DropdownOption } from "./components/Dropdown";
import { Chip, ChipGroup, InputField } from "./components/FieldControls";
import FormulaBreakdownPanel from "./components/FormulaBreakdownPanel";
import ResultPanel from "./components/ResultPanel";
import ReverseCalcPanel from "./components/ReverseCalcPanel";

const DEFAULT_INPUT: AspdInput = {
  family: "Swordman",
  jobId: "class12:Knight",
  weaponIdx: 3,
  offHand: "none",
  agiBase: 90,
  agiBonus: 0,
  dexBase: 30,
  dexBonus: 0,
  potionIdx: 0,
  skillPct: 0,
  equipPct: 0,
  flatASPD: 0,
  targetASPD: 190,
};

const FAMILY_OPTIONS: DropdownOption<JobFamily>[] = FAMILIES.map((family) => ({ value: family, label: family }));

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

/** Keep the weapon in hand when the new job can hold it, else its first real weapon */
function weaponFor(job: JobEntry, weaponIdx: number) {
  return job.weapons.includes(weaponIdx) ? weaponIdx : (job.weapons[1] ?? 0);
}

/** A numbered panel of the form, drawn as a HUD frame */
function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="aspd-hud p-5">
      <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold">
        <span className="rounded-md bg-primary px-1.5 py-0.5 font-mono text-xs font-bold text-primary-content">
          0{number}
        </span>
        {title}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export default function AspdCalculator() {
  const [input, setInput] = useState<AspdInput>(DEFAULT_INPUT);

  const set = <K extends keyof AspdInput>(key: K, value: AspdInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const familyJobs = JOBS.filter((entry) => entry.family === input.family);
  const job = familyJobs.find((entry) => entry.id === input.jobId) ?? familyJobs[0] ?? JOBS[0];
  const tier = CLASS_TIERS[job.tier];
  const maxASPD = tier.maxASPD;

  const weaponIdx = weaponFor(job, input.weaponIdx);
  const weaponFactor = job.weaponFactors[weaponIdx] ?? 0;

  const dualWield = offHandWeapons(job);
  const offHandIdx = input.offHand.startsWith("w:") ? Number.parseInt(input.offHand.slice(2), 10) : null;
  const offHand: OffHandSelection =
    offHandIdx !== null && !dualWield.includes(offHandIdx) ? "none" : input.offHand;
  const offHandFactor =
    offHand === "shield"
      ? job.shieldPenalty
      : offHand !== "none" && offHandIdx !== null
        ? (job.offHandFactors?.[offHandIdx] ?? job.weaponFactors[offHandIdx] ?? 0)
        : 0;

  // Only an Assassin Cross survives a Poison Bottle, so no other job can pick it
  const canPoison = job.label === "Assassin Cross";
  const potionIdx = POTIONS[input.potionIdx]?.assassinOnly && !canPoison ? 0 : input.potionIdx;
  const potionMod = (POTIONS[potionIdx] ?? POTIONS[0]).mod;

  const agi = input.agiBase + input.agiBonus;
  const dex = input.dexBase + input.dexBonus;
  const targetASPD = Math.min(input.targetASPD, maxASPD);

  const result = calcASPD(
    job.baseASPD,
    weaponFactor,
    offHandFactor,
    agi,
    dex,
    potionMod,
    input.skillPct / 100,
    input.equipPct / 100,
    input.flatASPD,
    maxASPD,
  );

  const reverseCalc = stepsToASPD(
    targetASPD,
    job.baseASPD,
    weaponFactor,
    offHandFactor,
    agi,
    dex,
    potionMod,
    input.skillPct / 100,
    input.equipPct / 100,
    input.flatASPD,
    maxASPD,
  );

  const selectJob = (next: JobEntry) =>
    setInput((prev) => ({
      ...prev,
      family: next.family,
      jobId: next.id,
      weaponIdx: weaponFor(next, prev.weaponIdx),
      offHand: "none",
    }));

  const jobOptions: DropdownOption<string>[] = TIER_ORDER.flatMap((tierKey) =>
    familyJobs
      .filter((entry) => entry.tier === tierKey)
      .map((entry) => ({
        value: entry.id,
        label: entry.label,
        group: CLASS_TIERS[tierKey].label,
        groupNote: `Max ${CLASS_TIERS[tierKey].maxASPD}`,
      })),
  );

  const weaponOptions: DropdownOption<number>[] = job.weapons.map((index) => ({
    value: index,
    label: index === 0 ? "มือเปล่า" : WEAPONS[index].label,
    note: job.weaponFactors[index] !== undefined ? signed(job.weaponFactors[index]) : undefined,
  }));

  const offHandOptions: DropdownOption<OffHandSelection>[] = [
    { value: "none", label: "ว่าง" },
    { value: "shield", label: "Shield", note: signed(job.shieldPenalty) },
    ...dualWield.map((index) => ({
      value: `w:${index}` as OffHandSelection,
      label: WEAPONS[index].label,
      note: signed(job.offHandFactors?.[index] ?? job.weaponFactors[index] ?? 0),
      group: "ถืออาวุธอีกมือ",
    })),
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 p-4 pb-24 lg:pb-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-content shadow-[0_0_18px_var(--color-primary)]">
            <Zap aria-hidden="true" className="size-6 fill-current" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">ASPD Calculator</h1>
            <p className="text-sm text-base-content/70">เลือกอาชีพ อาวุธ แล้วใส่ Status ผลลัพธ์เปลี่ยนตามทันที</p>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-outline btn-primary" onClick={() => setInput(DEFAULT_INPUT)}>
          รีเซ็ต
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <Step number={1} title="อาชีพและอาวุธ">
            <div className="grid gap-4 sm:grid-cols-2">
              <Dropdown
                label="อาชีพหลัก"
                value={input.family}
                options={FAMILY_OPTIONS}
                onChange={(family) => {
                  const first = JOBS.find((entry) => entry.family === family);
                  if (first) selectJob(first);
                }}
              />
              <Dropdown
                label="อาชีพ"
                value={job.id}
                options={jobOptions}
                onChange={(id) => {
                  const next = familyJobs.find((entry) => entry.id === id);
                  if (next) selectJob(next);
                }}
              />
            </div>

            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                {tier.label}
              </span>
              <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-content">
                Max ASPD {maxASPD}
              </span>
              <span className="font-mono text-xs text-base-content/70">Base ASPD {job.baseASPD}</span>
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Dropdown
                label="อาวุธ"
                value={weaponIdx}
                options={weaponOptions}
                onChange={(index) => setInput((prev) => ({ ...prev, weaponIdx: index, offHand: "none" }))}
              />
              <Dropdown
                label="มืออีกข้าง"
                value={offHand}
                options={offHandOptions}
                onChange={(value) => set("offHand", value)}
              />
            </div>
            <p className="-mt-2 text-xs text-base-content/70">ตัวเลขท้ายชื่อ = ASPD ที่อาวุธชิ้นนั้นหักออก</p>
          </Step>

          <Step number={2} title="Status">
            <div>
              <div className="grid grid-cols-[2.5rem_1fr_auto_1fr_auto_3rem] items-center gap-x-2 gap-y-3">
                <span />
                <span className="text-xs text-base-content/70">ค่าตัวละคร</span>
                <span />
                <span className="text-xs text-base-content/70">โบนัส</span>
                <span />
                <span className="text-right text-xs text-base-content/70">รวม</span>

                <span className="font-bold">AGI</span>
                <InputField label="AGI ค่าตัวละคร" hideLabel value={input.agiBase} onChange={(value) => set("agiBase", value)} max={999} />
                <span className="text-base-content/60">+</span>
                <InputField label="AGI โบนัส" hideLabel value={input.agiBonus} onChange={(value) => set("agiBonus", value)} max={999} />
                <span className="text-base-content/60">=</span>
                <span className="text-right font-mono text-xl font-black text-primary">{agi}</span>

                <span className="font-bold">DEX</span>
                <InputField label="DEX ค่าตัวละคร" hideLabel value={input.dexBase} onChange={(value) => set("dexBase", value)} max={999} />
                <span className="text-base-content/60">+</span>
                <InputField label="DEX โบนัส" hideLabel value={input.dexBonus} onChange={(value) => set("dexBonus", value)} max={999} />
                <span className="text-base-content/60">=</span>
                <span className="text-right font-mono text-xl font-black text-primary">{dex}</span>
              </div>
              <p className="mt-3 text-xs text-base-content/70">
                ใส่ตามหน้าต่าง Status ในเกม เช่น AGI 90 + 12 ให้ใส่ 90 และ 12
              </p>
            </div>
          </Step>

          <Step number={3} title="โบนัส ASPD">
            <ChipGroup
              label="Potion"
              note={canPoison ? undefined : "Poison Bottle ใช้ได้เฉพาะ Assassin Cross"}
            >
              {POTIONS.map((entry, index) => (
                <Chip
                  key={entry.label}
                  selected={index === potionIdx}
                  disabled={entry.assassinOnly && !canPoison}
                  onSelect={() => set("potionIdx", index)}
                >
                  {entry.label}
                  {entry.mod > 0 ? <span className="font-mono text-xs opacity-70">+{Math.round(entry.mod * 100)}%</span> : null}
                </Chip>
              ))}
            </ChipGroup>

            <div className="grid gap-4 sm:grid-cols-3">
              <InputField label="จากสกิล" value={input.skillPct} onChange={(value) => set("skillPct", value)} max={100} suffix="%" hint="เช่น Two-Hand Quicken, Adrenaline Rush" />
              <InputField label="จากของสวมใส่" value={input.equipPct} onChange={(value) => set("equipPct", value)} max={100} suffix="%" hint="ของและการ์ดที่เขียนว่า ASPD +%" />
              <InputField label="ASPD บวกตรง" value={input.flatASPD} onChange={(value) => set("flatASPD", value)} max={50} hint="ของที่เขียนว่า ASPD +1, +2" />
            </div>
          </Step>
        </div>

        <div id="aspd-result" className="flex scroll-mt-20 flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          <ResultPanel tierLabel={job.label} maxASPD={maxASPD} result={result} />
          <ReverseCalcPanel
            currentASPD={result.final}
            maxASPD={maxASPD}
            targetASPD={targetASPD}
            agi={agi}
            dex={dex}
            reverseCalc={reverseCalc}
            onTargetChange={(value) => set("targetASPD", value)}
          />
        </div>
      </div>

      <FormulaBreakdownPanel
        result={result}
        jobBaseASPD={job.baseASPD}
        weaponFactor={weaponFactor}
        offHandFactor={offHandFactor}
        agi={agi}
        dex={dex}
        potionMod={potionMod}
        skillPct={input.skillPct}
        equipPct={input.equipPct}
        flatASPD={input.flatASPD}
        maxASPD={maxASPD}
      />

      {/* Mobile: the result stays in reach while the form scrolls */}
      <a
        href="#aspd-result"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-sky-400/60 bg-[#06121f] px-4 py-2.5 text-sky-50 shadow-[0_-4px_20px_rgb(56_189_248/0.3)] lg:hidden"
      >
        <span className="flex items-baseline gap-2">
          <Zap aria-hidden="true" className="size-4 self-center fill-current text-sky-300" />
          <span className="font-mono text-xs font-bold text-sky-300">ASPD</span>
          <span className="aspd-digits font-mono text-3xl font-black leading-none">{result.final}</span>
          <span className="font-mono text-xs text-sky-200/80">{result.finalExact.toFixed(2)}</span>
        </span>
        <span className="text-right text-xs text-sky-100/90">
          <span className="font-mono text-sm font-bold text-sky-300">
            {attacksPerSecond(result.finalRaw, maxASPD).toFixed(2)}
          </span>{" "}
          ครั้ง/วิ · Max {maxASPD}
        </span>
      </a>
    </div>
  );
}
