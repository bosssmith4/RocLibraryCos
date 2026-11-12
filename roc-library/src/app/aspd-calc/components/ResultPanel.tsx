import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { attacksPerSecond } from "@/utils/aspdFormula";
import { AspdTrack, BeatLane } from "./ASPDGauge";
import type { ResultPanelProps } from "../types";

/** Runs the shown number up or down to the target instead of jumping; jumps when motion is reduced. */
function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const value = Math.round(from + (target - from) * (1 - (1 - progress) ** 3));
      current.current = value;
      setShown(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

export default function ResultPanel({ tierLabel, maxASPD, result }: ResultPanelProps) {
  const shownASPD = useCountUp(result.final);
  const attacksPerSec = attacksPerSecond(result.finalRaw, maxASPD);
  const atCap = result.final >= maxASPD;
  const overCap = result.finalRaw - maxASPD;
  const toNext = Math.floor(result.finalRaw) + 1 - result.finalRaw;

  return (
    <section
      aria-labelledby="aspd-result-heading"
      className={`aspd-screen flex flex-col gap-5 p-5 ${atCap ? "aspd-screen-max" : ""}`}
    >
      {/* Remounts on every change of ASPD, so the glow plays once per change */}
      <span key={result.final} className="aspd-flash" />
      <Zap
        aria-hidden="true"
        strokeWidth={1}
        className="pointer-events-none absolute -right-8 -top-6 size-56 text-sky-400/10"
      />

      <div className="relative flex items-center justify-between gap-3">
        <h2 id="aspd-result-heading" className="flex items-center gap-1.5 font-mono text-sm font-bold uppercase tracking-widest text-sky-300">
          <Zap aria-hidden="true" className="size-4 fill-current" />
          ASPD
        </h2>
        <span className="text-xs text-sky-100/80">
          {tierLabel} · Max {maxASPD}
        </span>
      </div>

      <div className="relative">
        <p className="sr-only" aria-live="polite">
          ASPD {result.final}
        </p>
        <div className="flex items-end gap-3" aria-hidden="true">
          <p className={`aspd-digits font-mono text-8xl font-black leading-none tabular-nums ${atCap ? "text-amber-300" : "text-sky-100"}`}>
            {shownASPD}
          </p>
          {atCap ? (
            <span className="mb-2 rounded-md bg-amber-400 px-2.5 py-1 font-mono text-sm font-black text-amber-950">MAX</span>
          ) : (
            <span className="mb-2 font-mono text-xl font-bold text-sky-300">
              .{result.finalExact.toFixed(2).split(".")[1]}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-sky-100/90">
          {atCap ? (
            <>
              ถึง Max {maxASPD} แล้ว
              {overCap >= 0.01 ? ` (เกินมา ${overCap.toFixed(2)})` : ""}
            </>
          ) : (
            <>
              ขาดอีก <span className="font-mono font-bold text-sky-300">{toNext.toFixed(2)}</span> จะขึ้นเป็น {result.final + 1}
            </>
          )}
        </p>
      </div>

      <div className="relative">
        <AspdTrack aspd={result.finalExact} max={maxASPD} />
      </div>

      <div className="relative border-t border-sky-400/25 pt-4">
        <p className="mb-2 flex items-baseline justify-between gap-3 text-sm text-sky-100/90">
          <span>
            ตี <span className="font-mono text-2xl font-black text-sky-300">{attacksPerSec.toFixed(2)}</span> ครั้ง/วินาที
          </span>
          <span className="text-sky-100/80">ทุก {(1 / attacksPerSec).toFixed(2)} วิ</span>
        </p>
        <BeatLane attacksPerSec={attacksPerSec} />
      </div>
    </section>
  );
}
