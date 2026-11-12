const SCALE_MIN = 100;
const SCALE_MAX = 198;
const CAPS = [190, 193];

function position(value: number) {
  return Math.min(100, Math.max(0, ((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));
}

/**
 * A track from 100 to just past 193 with both class caps marked; the cap of the chosen Class tier is the strong one.
 * Drawn for the dark readout screen, so its colours are fixed rather than taken from the theme.
 */
export function AspdTrack({ aspd, max }: { aspd: number; max: number }) {
  return (
    <div>
      <div
        role="meter"
        aria-label="ASPD เทียบกับ Max"
        aria-valuemin={SCALE_MIN}
        aria-valuemax={max}
        aria-valuenow={aspd}
        className="relative h-3 rounded-full bg-sky-400/15"
      >
        <div
          className="relative h-full overflow-hidden rounded-full bg-linear-to-r from-sky-500 to-cyan-300 shadow-[0_0_12px_rgb(56_189_248/0.8)] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${position(aspd)}%` }}
        >
          <span className="aspd-shine" />
        </div>
        {CAPS.map((cap) => (
          <span
            key={cap}
            className={`absolute -top-1.5 h-6 rounded-full ${cap === max ? "w-1 bg-amber-400 shadow-[0_0_8px_rgb(251_191_36/0.9)]" : "w-0.5 bg-sky-200/40"}`}
            style={{ left: `${position(cap)}%` }}
          />
        ))}
      </div>
      <div className="relative mt-2 h-4 font-mono text-xs">
        <span className="absolute left-0 text-sky-200/70">{SCALE_MIN}</span>
        {CAPS.map((cap) => (
          <span
            key={cap}
            className={`absolute ${cap === max ? "font-bold text-amber-300" : "text-sky-200/70"} ${cap === 190 ? "-translate-x-full pr-1" : "right-0"}`}
            style={cap === 190 ? { left: `${position(cap)}%` } : undefined}
          >
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * One second drawn as a lane: a mark for every attack that lands in it, and a playhead that
 * crosses it once a second, so a faster build shows as a denser lane.
 */
export function BeatLane({ attacksPerSec }: { attacksPerSec: number }) {
  const beats: number[] = [];
  for (let hit = 0; hit / attacksPerSec < 1 && beats.length < 12; hit += 1) {
    beats.push((hit / attacksPerSec) * 100);
  }

  return (
    <div aria-hidden="true">
      <div className="relative h-10 overflow-hidden rounded-lg border border-sky-400/25 bg-sky-400/10">
        {beats.map((left) => (
          <span
            key={left}
            className="absolute inset-y-2 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgb(125_211_252/0.9)]"
            style={{ left: `calc(${left}% + 6px)` }}
          />
        ))}
        <span className="aspd-sweep absolute inset-y-0 w-0.5 bg-amber-400 shadow-[0_0_8px_rgb(251_191_36/0.9)]" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-xs text-sky-200/70">
        <span>0 วิ</span>
        <span>1 วิ</span>
      </div>
    </div>
  );
}
