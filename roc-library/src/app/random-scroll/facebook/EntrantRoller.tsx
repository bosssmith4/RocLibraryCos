"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Entrant } from "@/types/commentDraw";
import { playTick, playWin, unlockAudio } from "@/components/ScrollRoller/sound";
import { SERVER_STYLE } from "./serverStyle";

const CELL = 168;
const STRIP_LENGTH = 60;
const WINNER_INDEX = 52;
const SECONDS = 3;
const IDLE_SPEED = 40; // px per second, as on the Random Scroll page

export interface EntrantRollerHandle {
  /** Slides the strip so it stops on the winner; resolves when it has stopped. */
  spin: (winner: Entrant, pool: Entrant[]) => Promise<void>;
}

export function EntrantCard({ entrant, highlight = false }: { entrant: Entrant; highlight?: boolean }) {
  return (
    <div
      className={`flex h-full w-full flex-col justify-center gap-0.5 rounded-lg border-2 px-2 py-1 ${SERVER_STYLE[entrant.server].card} ${highlight ? "ring-2 ring-base-content" : ""}`}
    >
      <span className="line-clamp-2 text-sm font-bold leading-tight text-base-content">
        {entrant.facebookName}
      </span>
      <span className="truncate text-xs text-base-content/80">{entrant.characterName || "-"}</span>
      <span className="text-xs text-base-content/70">
        {entrant.cCode} · {entrant.server}
      </span>
    </div>
  );
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * One strip of Entrant cards. Until the first draw it drifts slowly through the pool in a random
 * order; a draw spins it to the Winner, where it stays until the next draw.
 */
const EntrantRoller = forwardRef<EntrantRollerHandle, { idle: Entrant[] }>(function EntrantRoller(
  { idle },
  ref,
) {
  const [strip, setStrip] = useState<Entrant[] | null>(null);
  // The idle order is shuffled in the browser only, so the server render stays the same as the first client one.
  const [order, setOrder] = useState<Entrant[] | null>(null);
  const [stopped, setStopped] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef(idle);

  useEffect(() => {
    idleRef.current = idle;
  });

  const idleKey = idle.map((e) => e.commentId).join(",");
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOrder(shuffle(idleRef.current)));
    return () => cancelAnimationFrame(raf);
  }, [idleKey]);

  const idleList = order ?? idle;
  // Enough copies of the list that the strip never shows an empty end while it wraps around.
  const repeats = idleList.length === 0 ? 0 : Math.max(2, Math.ceil(1600 / (idleList.length * CELL)) + 1);

  useEffect(() => {
    if (strip || idleList.length === 0) return;
    const cycle = idleList.length * CELL;
    let pos = 0;
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      pos = (pos + (IDLE_SPEED * (now - last)) / 1000) % cycle;
      last = now;
      if (stripRef.current) stripRef.current.style.transform = `translateX(${-pos}px)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [strip, idleList]);

  useImperativeHandle(ref, () => ({
    spin: (winner, pool) =>
      new Promise<void>((resolve) => {
        unlockAudio();
        const pick = () => pool[Math.floor(Math.random() * pool.length)];
        const cells = Array.from({ length: STRIP_LENGTH }, (_, i) => (i === WINNER_INDEX ? winner : pick()));
        const viewWidth = viewRef.current?.clientWidth ?? 600;
        const jitter = (Math.random() - 0.5) * CELL * 0.6;
        const offset = WINNER_INDEX * CELL + CELL / 2 - viewWidth / 2 + jitter;

        setStopped(false);
        setStrip(cells);
        const start = performance.now();
        let lastCell = -1;
        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / (SECONDS * 1000));
          const p = 1 - Math.pow(1 - t, 4);
          if (stripRef.current) stripRef.current.style.transform = `translateX(${-offset * p}px)`;
          const cell = Math.floor((offset * p) / CELL);
          if (cell !== lastCell) {
            lastCell = cell;
            playTick();
          }
          if (t < 1) requestAnimationFrame(frame);
          else {
            setStopped(true);
            playWin("SR");
            resolve();
          }
        };
        requestAnimationFrame(frame);
      }),
  }));

  const cells = strip ?? Array.from({ length: idleList.length * repeats }, (_, k) => idleList[k % idleList.length]);

  return (
    <div
      ref={viewRef}
      className="relative h-36 overflow-hidden rounded-box border border-base-300 bg-base-100"
    >
      <div ref={stripRef} className="flex h-full will-change-transform">
        {cells.map((e, i) => (
          <div key={`${e.commentId}-${i}`} style={{ width: CELL }} className="h-full shrink-0 p-1.5">
            <EntrantCard entrant={e} highlight={stopped && i === WINNER_INDEX} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-error shadow-[0_0_8px] shadow-error" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-base-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-base-100 to-transparent" />
    </div>
  );
});

export default EntrantRoller;
