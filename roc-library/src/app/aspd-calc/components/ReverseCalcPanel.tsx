import type { ReverseCalcPanelProps } from "../types";
import { Chip, NumberInput } from "./FieldControls";

const QUICK_TARGETS = [180, 185, 190, 193];

function NeededStat({ name, current, needed }: { name: string; current: number; needed: number | null }) {
  return (
    <div className="rounded-xl bg-base-200 p-3 text-center">
      <p className="text-xs text-base-content/70">เพิ่ม {name} อย่างเดียว</p>
      {needed !== null ? (
        <>
          <p className="font-mono text-2xl font-black text-primary">+{needed}</p>
          <p className="font-mono text-xs text-base-content/70">{current} → {current + needed}</p>
        </>
      ) : (
        <p className="mt-2 text-sm font-bold text-base-content/70">ไม่พอถึง</p>
      )}
    </div>
  );
}

export default function ReverseCalcPanel({
  currentASPD,
  maxASPD,
  targetASPD,
  agi,
  dex,
  reverseCalc,
  onTargetChange,
}: ReverseCalcPanelProps) {
  return (
    <section className="aspd-hud flex flex-col gap-3 p-5">
      <h2 className="text-base font-bold">อยากได้ ASPD เท่าไร</h2>
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_TARGETS.filter((target) => target <= maxASPD).map((target) => (
          <Chip key={target} selected={targetASPD === target} onSelect={() => onTargetChange(target)}>
            <span className="font-mono">{target}</span>
          </Chip>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-xs text-base-content/70">หรือพิมพ์เอง</span>
          <NumberInput
            min={1}
            max={maxASPD}
            value={targetASPD}
            onChange={onTargetChange}
            className="input input-bordered h-10 w-20 text-center font-mono text-base font-bold"
          />
        </label>
      </div>

      {currentASPD >= targetASPD ? (
        <p className="rounded-xl bg-success/15 p-3 text-sm font-bold">ถึง {targetASPD} แล้ว (ตอนนี้ {currentASPD})</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NeededStat name="AGI" current={agi} needed={reverseCalc.agiNeeded} />
          <NeededStat name="DEX" current={dex} needed={reverseCalc.dexNeeded} />
        </div>
      )}
    </section>
  );
}
