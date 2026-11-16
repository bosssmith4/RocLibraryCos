import { createClient } from "@supabase/supabase-js";
import MonstersDb from "@/services/mosters/mostersDb";
import { DETAIL_MAX, DETAIL_MIN, NAME_MAX, PROBLEMS, type BossReportRow } from "@/utils/bossReportLimits";
import { listBoardRows, setBoardRowDone } from "@/utils/devBoardRecord";
import type { BoardStatus } from "@/utils/devBoard";
import { formatCooldown } from "@/utils/mvpRespawn";

/** The Spawn report table: every note sent from the MVP Hunter. Server-side only (service key). */
const TABLE = "boss_reports";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const bossReportConfigured = () => client() !== null;

export type BossReportInput = {
  monsterId: number;
  monsterName: string;
  spawnMap: string;
  /** what the MVP Hunter shows for that Spawn map, so the owner sees what the sender saw */
  listed: string;
  problem: string;
  detail: string;
  name: string | null;
};

/**
 * Checks the sent body. The boss and Spawn map must be ones the MVP Hunter lists, and their
 * name and listed time are taken from the list, not from the sender.
 */
export function checkBossReport(
  body: Record<string, unknown>,
): { ok: true; value: BossReportInput } | { ok: false; message: string } {
  const monster = MonstersDb().find((m) => m.id === body.monsterId && m.mapspawn?.length);
  const spawn = monster?.mapspawn?.find((s) => s.map === body.spawnMap);
  if (!monster || !spawn) return { ok: false, message: "ไม่พบบอสหรือแมพที่แจ้งมา" };

  const problem = PROBLEMS.find((p) => p.id === body.problem);
  if (!problem) return { ok: false, message: "กรุณาเลือกว่าข้อมูลผิดตรงไหน" };

  const detail = typeof body.detail === "string" ? body.detail.trim() : "";
  if (detail.length < DETAIL_MIN) {
    return { ok: false, message: `กรุณาบอกสิ่งที่ถูกต้อง อย่างน้อย ${DETAIL_MIN} ตัวอักษร` };
  }
  if (detail.length > DETAIL_MAX) return { ok: false, message: `ข้อความยาวเกิน ${DETAIL_MAX} ตัวอักษร` };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length > NAME_MAX) return { ok: false, message: `ชื่อยาวเกิน ${NAME_MAX} ตัวอักษร` };

  return {
    ok: true,
    value: {
      monsterId: monster.id,
      monsterName: monster.name,
      spawnMap: spawn.map,
      listed: spawn.cooldown[1] === 0 ? "เกิดใหม่ทันที" : formatCooldown(spawn.cooldown),
      problem: problem.label,
      detail,
      name: name || null,
    },
  };
}

/** Saves one report. Returns false when it could not be saved. */
export async function saveBossReport(input: BossReportInput) {
  const db = client();
  if (!db) return false;
  const { error } = await db.from(TABLE).insert({
    monster_id: input.monsterId,
    monster_name: input.monsterName,
    spawn_map: input.spawnMap,
    listed: input.listed,
    problem: input.problem,
    detail: input.detail,
    name: input.name,
  });
  return !error;
}

const toReport = (r: Record<string, unknown>): BossReportRow => ({
  id: r.id as number,
  createdAt: r.created_at as string,
  monsterId: r.monster_id as number,
  monsterName: r.monster_name as string,
  spawnMap: r.spawn_map as string,
  listed: r.listed as string,
  problem: r.problem as string,
  detail: r.detail as string,
  name: (r.name as string | null) ?? null,
  fixedAt: (r.fixed_at as string | null) ?? null,
});

/** Reads one page of reports, newest first, with how many there are in each status. Dev board only. */
export const listBossReports = (status: BoardStatus, page: number) =>
  listBoardRows(TABLE, "fixed_at", status, page, toReport);

/** Marks one report fixed, or open again. Returns false when it could not be saved. Dev board only. */
export const setBossReportFixed = (id: number, fixed: boolean) => setBoardRowDone(TABLE, "fixed_at", id, fixed);
