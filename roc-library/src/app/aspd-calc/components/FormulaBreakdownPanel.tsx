import type { ReactNode } from "react";
import type { FormulaBreakdownPanelProps } from "../types";

function Step({ title, rule, children }: { title: string; rule: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-primary/30 pl-3">
      <p className="font-sans text-sm font-bold text-primary">{title}</p>
      <p className="mt-1 text-base-content/70">{rule}</p>
      <p className="mt-1 font-bold">{children}</p>
    </div>
  );
}

export default function FormulaBreakdownPanel({
  result,
  jobBaseASPD,
  weaponFactor,
  offHandFactor,
  agi,
  dex,
  potionMod,
  skillPct,
  equipPct,
  flatASPD,
  maxASPD,
}: FormulaBreakdownPanelProps) {
  return (
    <details className="aspd-hud group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-base font-bold [&::-webkit-details-marker]:hidden">
        <span>ดูสูตรและวิธีคิดทีละขั้น</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-180 motion-reduce:transition-none">▼</span>
      </summary>

      <div className="space-y-4 wrap-break-word border-t border-base-content/10 px-5 py-5 font-mono text-xs leading-relaxed">
        <div>
          <p className="font-sans text-sm font-bold">สูตรหลัก</p>
          <p className="mt-1 text-base-content/70">
            Base ASPD = 200 − (200 − (Job Base + Off-Hand − Correction + √(AGI × 9.999 + DEX × 0.19212) × Penalty)) × (1 − Potion − Skill)
          </p>
          <p className="text-base-content/70">Final ASPD = Base ASPD + Equip ASPD % + Flat ASPD</p>
        </div>

        <Step title="① Job Base ASPD" rule="Job Base ASPD = Base ของอาชีพ + Weapon factor">
          = {jobBaseASPD} + ({weaponFactor}) = {result.jobWeaponBase}
        </Step>

        <Step title="② ASPD Penalty" rule="Penalty = 1 − ((Job Base ASPD − 144) ÷ 50) เมื่อ Job Base ASPD มากกว่า 145, นอกนั้น 0.96">
          = {result.aspdPenalty.toFixed(2)}
        </Step>

        <Step title="③ ASPD Correction" rule="Correction = (√205 − √AGI) ÷ 7.15 ปัดขึ้น 3 ตำแหน่ง (AGI 205 ขึ้นไป = 0)">
          = (√205 − √{agi}) ÷ 7.15 = {result.aspdCorrection.toFixed(3)}
        </Step>

        <Step title="④ Stat Root" rule="Stat Root = √(AGI × 9.999 + DEX × 0.19212)">
          = √({agi} × 9.999 + {dex} × 0.19212) = {result.statTerm.toFixed(4)}
        </Step>

        <Step title="⑤ Base Case" rule="Base Case = Job Base ASPD + Off-Hand − Correction + (Stat Root × Penalty)">
          = {result.jobWeaponBase} + ({offHandFactor}) − {result.aspdCorrection.toFixed(3)} + ({result.statTerm.toFixed(4)} × {result.aspdPenalty.toFixed(2)}) = {result.baseCase.toFixed(4)}
        </Step>

        <Step title="⑥ Total Percent Mod" rule="Total Percent Mod = Potion + Skill">
          = {potionMod.toFixed(2)} + {(skillPct / 100).toFixed(2)} = {result.bonusTotal.toFixed(2)}
        </Step>

        <Step title="⑦ Base ASPD" rule="Base ASPD = 200 − (200 − Base Case) × (1 − Total Percent Mod)">
          = 200 − (200 − {result.baseCase.toFixed(4)}) × (1 − {result.bonusTotal.toFixed(2)}) = {result.baseASPD.toFixed(4)}
        </Step>

        <Step title="⑧ Equip ASPD %" rule="Equip ASPD % = (195 − Base ASPD) × Equip Mod ปัดลง 1 ตำแหน่ง">
          = (195 − {result.baseASPD.toFixed(4)}) × {(equipPct / 100).toFixed(2)} = {result.equipContrib.toFixed(1)}
        </Step>

        <div className="border-t border-base-content/10 pt-4">
          <p className="font-sans text-sm font-bold text-primary">Final ASPD</p>
          <p className="mt-1 text-base-content/70">
            Final ASPD = Base ASPD + Equip ASPD % + Flat ASPD ปัดลง 2 ตำแหน่ง ไม่เกิน Max {maxASPD} แล้วปัดลงเป็นจำนวนเต็มตามที่เกมแสดง
          </p>
          <p className="mt-1 text-sm font-bold">
            = {result.baseASPD.toFixed(4)} + {result.equipContrib.toFixed(1)} + {flatASPD} = {result.finalRaw.toFixed(4)} → {result.finalExact.toFixed(2)} → <span className="text-primary">{result.final}</span>
          </p>
        </div>
      </div>
    </details>
  );
}
