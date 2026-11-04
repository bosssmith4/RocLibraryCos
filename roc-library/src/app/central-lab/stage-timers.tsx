"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

const STORAGE_KEY = "roc-cenlab-extra-time";
const TICK_MS = 200;
const EXTRA_TIME_OPTIONS = [0, 5, 10, 15];
const STAGES = [
  { label: "Stage 1", waitSeconds: 150 },
  { label: "Stage 2", waitSeconds: 80 },
  { label: "Stage 3", waitSeconds: 160 },
];

type TimerStatus = "idle" | "running" | "paused" | "done";

interface TimerState {
  status: TimerStatus;
  /** Only meaningful once started; an idle timer shows its Wait time plus the Extra time. */
  remainingMs: number;
  /** The clock time a running timer reaches zero, so a slowed-down tab can never make it drift. */
  endsAt: number;
  /** The full length since the last Reset, which the progress bar measures against. */
  totalMs: number;
}

const STATUS_LABEL: Record<TimerStatus, string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  done: "Time's up",
};

const IDLE_TIMER: TimerState = { status: "idle", remainingMs: 0, endsAt: 0, totalMs: 0 };

function loadExtraTime(): number {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (EXTRA_TIME_OPTIONS.includes(saved)) return saved;
  } catch {
    // storage unavailable: keep the default
  }
  return 0;
}

const formatClock = (totalSeconds: number) =>
  `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

const formatWaitTime = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;

async function playAlarmSound() {
  for (let i = 0; i < 3; i++) {
    const audio = new Audio("/assets/sound/beep.mp3");
    audio.volume = 0.8;
    await new Promise((resolve) => {
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

function toggledTimer(timer: TimerState, remaining: number): TimerState {
  const now = Date.now();
  return timer.status === "running"
    ? { ...timer, status: "paused", remainingMs: Math.max(0, timer.endsAt - now) }
    : {
        status: "running",
        remainingMs: remaining,
        endsAt: now + remaining,
        totalMs: timer.status === "idle" ? remaining : timer.totalMs,
      };
}

const subscribeNoop = () => () => {};

// Render only on the client so the saved Extra time can be read without a hydration mismatch.
export default function StageTimers() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  return mounted ? <StageTimersBody /> : null;
}

function StageTimersBody() {
  const [extraTime, setExtraTime] = useState(loadExtraTime);
  const [timers, setTimers] = useState<TimerState[]>(STAGES.map(() => IDLE_TIMER));

  const remainingMs = (index: number) =>
    timers[index].status === "idle"
      ? (STAGES[index].waitSeconds + extraTime) * 1000
      : timers[index].remainingMs;

  const chooseExtraTime = (seconds: number) => {
    setExtraTime(seconds);
    try {
      localStorage.setItem(STORAGE_KEY, String(seconds));
    } catch {
      // ignore
    }
  };

  const toggleTimer = (index: number) => {
    const remaining = remainingMs(index);
    setTimers((prev) =>
      prev.map((timer, i) => (i === index ? toggledTimer(timer, remaining) : timer)),
    );
  };

  const resetTimer = (index: number) => {
    setTimers((prev) => prev.map((timer, i) => (i === index ? IDLE_TIMER : timer)));
  };

  useEffect(() => {
    if (!timers.some((timer) => timer.status === "running")) return;

    const timeout = setTimeout(() => {
      const now = Date.now();
      const isFinished = (timer: TimerState) =>
        timer.status === "running" && timer.endsAt <= now;

      if (timers.some(isFinished)) playAlarmSound();
      setTimers(
        timers.map((timer) => {
          if (isFinished(timer)) return { ...timer, status: "done", remainingMs: 0 };
          if (timer.status === "running") return { ...timer, remainingMs: timer.endsAt - now };
          return timer;
        }),
      );
    }, TICK_MS);

    return () => clearTimeout(timeout);
  }, [timers]);

  return (
    <section aria-labelledby="stage-timers-title" className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <header>
          <h2 id="stage-timers-title" className="flex items-center gap-2 text-2xl font-bold text-base-content sm:text-3xl">
            <Timer aria-hidden="true" className="h-6 w-6 text-primary" /> Stage Timers
          </h2>
          <p className="mt-1 text-sm text-base-content/70 sm:text-base">
            กด Start หลังจบ Stage แล้วรอจนเสียงเตือนดังจึงเข้า Stage ถัดไป
          </p>
        </header>

        <div>
          <div role="group" aria-label="Extra time" className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-base-content">Extra time</span>
            <div className="join">
              {EXTRA_TIME_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  aria-pressed={extraTime === seconds}
                  onClick={() => chooseExtraTime(seconds)}
                  className={`btn join-item min-h-11 ${
                    extraTime === seconds ? "btn-primary" : "btn-outline border-base-300"
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-base-content/70 lg:text-right">
            ตัวที่เริ่มไปแล้วจะใช้ค่าใหม่หลังกด Reset
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STAGES.map((stage, index) => {
          const timer = timers[index];
          const { status } = timer;
          const remaining = remainingMs(index);
          const share = status === "idle" ? 1 : remaining / timer.totalMs;
          return (
            <article
              key={stage.label}
              className={`rounded-box border-2 bg-base-100 p-4 ${
                status === "done"
                  ? "border-error"
                  : status === "running"
                    ? "border-primary"
                    : "border-base-300"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-base-content">{stage.label}</h3>
                <p className="text-sm text-base-content/70">
                  Wait time {formatWaitTime(stage.waitSeconds)}
                </p>
              </div>

              <div
                className={`mt-2 font-mono text-5xl font-bold ${
                  status === "done" ? "text-error" : "text-base-content"
                }`}
                role="timer"
                aria-label={stage.label}
              >
                {formatClock(Math.ceil(remaining / 1000))}
              </div>

              {/* The bar helps a glance from the game; the clock above carries the information. */}
              <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-200">
                <div
                  className={`h-full rounded-full ${
                    status === "done" ? "bg-error" : "bg-primary"
                  }`}
                  style={{ width: `${status === "done" ? 100 : Math.round(share * 100)}%` }}
                />
              </div>

              <p
                aria-live="polite"
                className={`mt-2 text-sm font-semibold ${
                  status === "done" ? "text-error" : "text-base-content/70"
                }`}
              >
                {STATUS_LABEL[status]}
              </p>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <button
                  type="button"
                  onClick={() => toggleTimer(index)}
                  disabled={status === "done"}
                  className={`btn min-h-11 gap-1 ${
                    status === "running" ? "btn-warning" : "btn-primary"
                  }`}
                >
                  {status === "running" ? (
                    <><Pause aria-hidden="true" className="h-4 w-4" /> Pause</>
                  ) : (
                    <><Play aria-hidden="true" className="h-4 w-4" /> Start</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => resetTimer(index)}
                  className="btn btn-outline min-h-11 gap-1 border-base-300"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
