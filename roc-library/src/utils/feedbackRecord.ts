import { createClient } from "@supabase/supabase-js";
import { MESSAGE_MAX, MESSAGE_MIN, NAME_MAX } from "@/utils/feedbackLimits";

/** The Feedback table: every message sent from the Feedback page. Server-side only (service key). */
const TABLE = "feedback";


function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const feedbackConfigured = () => client() !== null;

export type FeedbackInput = { name: string | null; message: string };

/** Checks the sent body. An anonymous message, or an empty name, is kept with no name. */
export function checkFeedback(
  body: Record<string, unknown>,
): { ok: true; value: FeedbackInput } | { ok: false; message: string } {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < MESSAGE_MIN) {
    return { ok: false, message: `ข้อความต้องยาวอย่างน้อย ${MESSAGE_MIN} ตัวอักษร` };
  }
  if (message.length > MESSAGE_MAX) {
    return { ok: false, message: `ข้อความยาวเกิน ${MESSAGE_MAX} ตัวอักษร` };
  }
  const rawName = body.anonymous === true || typeof body.name !== "string" ? "" : body.name.trim();
  if (rawName.length > NAME_MAX) {
    return { ok: false, message: `ชื่อยาวเกิน ${NAME_MAX} ตัวอักษร` };
  }
  return { ok: true, value: { name: rawName || null, message } };
}

/** Saves one message. Returns false when it could not be saved. */
export async function saveFeedback(input: FeedbackInput) {
  const db = client();
  if (!db) return false;
  const { error } = await db.from(TABLE).insert({ name: input.name, message: input.message });
  return !error;
}
