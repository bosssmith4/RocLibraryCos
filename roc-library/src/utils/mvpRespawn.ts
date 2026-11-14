const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
// Thailand has no daylight saving, so its clock is always UTC+7.
const THAILAND_OFFSET_MS = 7 * 60 * MINUTE_MS;

export type RespawnStatus = "waiting" | "open" | "passed";

export interface RespawnWindow {
  from: number;
  to: number;
  status: RespawnStatus;
}

const thaiDay = (at: number) => Math.floor((at + THAILAND_OFFSET_MS) / DAY_MS);

/**
 * The moment a Death time ("HH:MM", Thailand time) points at: today, or yesterday when that
 * time of day has not come yet.
 */
export function deathMoment(time: string, now: number): number | undefined {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  if (minutes >= 24 * 60) return undefined;
  const at = thaiDay(now) * DAY_MS + minutes * MINUTE_MS - THAILAND_OFFSET_MS;
  return at > now ? at - DAY_MS : at;
}

export function respawnWindow(death: number, cooldown: [number, number], now: number): RespawnWindow {
  const from = death + cooldown[0] * MINUTE_MS;
  const to = death + cooldown[1] * MINUTE_MS;
  return { from, to, status: now < from ? "waiting" : now <= to ? "open" : "passed" };
}

/** "HH:MM" on Thailand's clock. */
export function thaiClock(at: number): string {
  const date = new Date(at + THAILAND_OFFSET_MS);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

/** "พรุ่งนี้" / "เมื่อวาน" and so on when the moment is not on today's date in Thailand; "" when it is. */
export function thaiDayLabel(at: number, now: number): string {
  const days = thaiDay(at) - thaiDay(now);
  if (days === 0) return "";
  if (days === 1) return "พรุ่งนี้";
  if (days === -1) return "เมื่อวาน";
  return days > 0 ? `อีก ${days} วัน` : `${-days} วันก่อน`;
}

/** "1:05:09" or "05:09". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const rest = `${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${rest}` : rest;
}

/** True when the boss returns within seconds of its death, so there is no Respawn window to work out. */
export const respawnsAtOnce = (cooldown: [number, number]) => cooldown[1] === 0;

/** "60–70 นาที", "ไม่เกิน 30 นาที" when it may return at once, or "24 ชม. – 24 ชม. 10 นาที" for a long wait. */
export function formatCooldown([min, max]: [number, number]): string {
  const part = (minutes: number) => {
    if (minutes < 180) return `${minutes} นาที`;
    const rest = minutes % 60;
    return `${Math.floor(minutes / 60)} ชม.${rest ? ` ${rest} นาที` : ""}`;
  };
  if (min === max) return part(min);
  if (min === 0) return `ไม่เกิน ${part(max)}`;
  return max < 180 ? `${min}–${max} นาที` : `${part(min)} – ${part(max)}`;
}
