import { createClient } from "@supabase/supabase-js";
import { buildLogRow, type IssuedKey } from "@/utils/botLicense";

/** The Key record: every licence key the Bot key page has issued. Server-side only (service key). */
const TABLE = "issued_keys";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const keyRecordConfigured = () => client() !== null;

/** Saves one issued key. Returns false when it could not be saved. */
export async function saveKey(issued: IssuedKey, days: number | undefined) {
  const db = client();
  if (!db) return false;
  const { error } = await db.from(TABLE).insert({
    issued_at: new Date(issued.issuedAt * 1000).toISOString(),
    machine_id: issued.machineId,
    name: issued.name,
    days: days ? String(days) : "permanent",
    key: issued.key,
    expires_at: issued.expiresAt ? new Date(issued.expiresAt * 1000).toISOString() : null,
  });
  return !error;
}

/** Reads the whole Key record, newest first, as the same rows the page shows. Null on failure. */
export async function listKeys() {
  const db = client();
  if (!db) return null;
  const { data, error } = await db
    .from(TABLE)
    .select("issued_at, machine_id, name, days")
    .order("issued_at", { ascending: false })
    .limit(5000);
  if (error || !data) return null;
  return data.map((r) => buildLogRow(Date.parse(r.issued_at), r.machine_id, r.name, r.days));
}
