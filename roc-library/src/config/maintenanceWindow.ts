/**
 * Server Maintenance Window Configuration
 * ROC Classic Server (Baphomet/Moonlight)
 *
 * Timezone: Asia/Bangkok (GMT+7)
 * Regular: Every Wednesday 06:00 - 14:00
 * Special: Add custom dates for events, closures, etc.
 */

const THAILAND_OFFSET_MS = 7 * 60 * 60 * 1000;

export const MAINTENANCE_WINDOW = {
  // Weekly maintenance, in Thailand time (GMT+7)
  weekday: 3, // 0 = Sunday ... 3 = Wednesday
  startHour: 6,
  startMinute: 0,
  endHour: 13,
  endMinute: 0,
};

export interface SpecialSchedule {
  startDate: Date;
  endDate: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  reason: string;
  type: "maintenance" | "event" | "closure"; // maintenance = server down, event = special event, closure = server closed
}

/**
 * Special schedule for server (events, closures, etc.)
 * Add entries here with specific dates and times.
 * startDate / endDate are calendar days (month is 0-indexed); the hours apply
 * to every day in the range, in Thailand time.
 */
export const SPECIAL_SCHEDULES: SpecialSchedule[] = [
  // Example format:
  // {
  //   startDate: new Date(2026, 4, 1), // May 1, 2026 (month is 0-indexed)
  //   endDate: new Date(2026, 4, 3),   // May 3, 2026
  //   startHour: 6,
  //   startMinute: 0,
  //   endHour: 14,
  //   endMinute: 0,
  //   reason: 'Server Migration',
  //   type: 'maintenance',
  // },
];

export interface MaintenanceSlot {
  start: Date;
  end: Date;
  reason: string;
}

export interface MaintenanceState {
  inMaintenance: boolean;
  /** The window the server is in right now, if any. */
  current: MaintenanceSlot | null;
  /** The next window that has not started yet, if any. */
  next: MaintenanceSlot | null;
}

// Thailand wall-clock time -> real instant.
const thaiWallTime = (y: number, m: number, d: number, h: number, min: number) =>
  new Date(Date.UTC(y, m, d, h, min) - THAILAND_OFFSET_MS);

function buildSlots(now: Date): MaintenanceSlot[] {
  const thai = new Date(now.getTime() + THAILAND_OFFSET_MS);
  const y = thai.getUTCFullYear();
  const m = thai.getUTCMonth();
  const d = thai.getUTCDate();
  const slots: MaintenanceSlot[] = [];

  // Today and the next two weeks cover the current and the next regular window.
  for (let i = 0; i <= 14; i++) {
    const day = new Date(Date.UTC(y, m, d + i));
    if (day.getUTCDay() !== MAINTENANCE_WINDOW.weekday) continue;
    const dy = day.getUTCFullYear();
    const dm = day.getUTCMonth();
    const dd = day.getUTCDate();
    slots.push({
      start: thaiWallTime(dy, dm, dd, MAINTENANCE_WINDOW.startHour, MAINTENANCE_WINDOW.startMinute),
      end: thaiWallTime(dy, dm, dd, MAINTENANCE_WINDOW.endHour, MAINTENANCE_WINDOW.endMinute),
      reason: "Weekly maintenance",
    });
  }

  for (const schedule of SPECIAL_SCHEDULES) {
    if (schedule.type === "event") continue;
    const first = Date.UTC(
      schedule.startDate.getFullYear(),
      schedule.startDate.getMonth(),
      schedule.startDate.getDate(),
    );
    const last = Date.UTC(
      schedule.endDate.getFullYear(),
      schedule.endDate.getMonth(),
      schedule.endDate.getDate(),
    );
    for (let t = first; t <= last; t += 24 * 60 * 60 * 1000) {
      const day = new Date(t);
      const dy = day.getUTCFullYear();
      const dm = day.getUTCMonth();
      const dd = day.getUTCDate();
      slots.push({
        start: thaiWallTime(dy, dm, dd, schedule.startHour, schedule.startMinute),
        end: thaiWallTime(dy, dm, dd, schedule.endHour, schedule.endMinute),
        reason: schedule.reason,
      });
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Where the server is relative to its maintenance windows at `now`.
 * Checks both the regular weekly window and special schedules.
 */
export function getMaintenanceState(now: Date = new Date()): MaintenanceState {
  const slots = buildSlots(now);
  const current =
    slots.find((s) => s.start <= now && now < s.end) ?? null;
  const next = slots.find((s) => s.start > now) ?? null;
  return { inMaintenance: current !== null, current, next };
}

export function isServerInMaintenance(): boolean {
  return getMaintenanceState().inMaintenance;
}
