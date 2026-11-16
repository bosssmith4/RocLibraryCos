import { createClient } from "@supabase/supabase-js";
import { BOARD_PAGE_SIZE, type BoardPage, type BoardStatus } from "@/utils/devBoard";

/** Reads and ticks rows for the dev note boards. Server-side only (service key). */
function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Row = Record<string, unknown>;

/** Supabase sometimes sends an empty message (a missing column on a count), so fall back to its other fields. */
const describe = (error: { message: string; details?: string | null; hint?: string | null; code?: string }) =>
  error.message || error.details || error.hint || `ตารางหรือคอลัมน์ไม่ถูกต้อง (${error.code ?? "ไม่ทราบสาเหตุ"})`;

/**
 * One page of a table, newest first, with how many rows each status holds. A row is "done" when its
 * `doneColumn` (a timestamp) is set.
 */
export async function listBoardRows<T>(
  table: string,
  doneColumn: string,
  status: BoardStatus,
  page: number,
  toRow: (row: Row) => T,
): Promise<{ ok: true; value: BoardPage<T> } | { ok: false; message: string }> {
  const db = client();
  if (!db) return { ok: false, message: "ยังไม่ได้ตั้งค่า SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" };

  const count = async (of: BoardStatus) => {
    const q = db.from(table).select("id", { count: "exact", head: true });
    const { count: n, error } = await (of === "open"
      ? q.is(doneColumn, null)
      : of === "done"
        ? q.not(doneColumn, "is", null)
        : q);
    if (error) throw new Error(describe(error));
    return n ?? 0;
  };

  try {
    const counts = { all: await count("all"), open: await count("open"), done: await count("done") };
    const pages = Math.max(1, Math.ceil(counts[status] / BOARD_PAGE_SIZE));
    const at = Math.min(Math.max(1, page), pages);
    const from = (at - 1) * BOARD_PAGE_SIZE;
    const q = db.from(table).select("*");
    const { data, error } = await (
      status === "open" ? q.is(doneColumn, null) : status === "done" ? q.not(doneColumn, "is", null) : q
    )
      .order("created_at", { ascending: false })
      .range(from, from + BOARD_PAGE_SIZE - 1);
    if (error) throw new Error(describe(error));
    return { ok: true, value: { rows: (data ?? []).map(toRow), counts, page: at, pages } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "อ่านข้อมูลไม่สำเร็จ" };
  }
}

/** Ticks one row (stamps the time) or unticks it. Returns false when it could not be saved. */
export async function setBoardRowDone(table: string, doneColumn: string, id: number, done: boolean) {
  const db = client();
  if (!db) return false;
  const { error } = await db
    .from(table)
    .update({ [doneColumn]: done ? new Date().toISOString() : null })
    .eq("id", id);
  return !error;
}
