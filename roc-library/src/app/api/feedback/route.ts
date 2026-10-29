import { NextResponse } from "next/server";
import { checkFeedback, feedbackConfigured, saveFeedback } from "@/utils/feedbackRecord";

/** Saves a message from the Feedback page. Open to everyone, so it is limited per address. */
export const dynamic = "force-dynamic";

const MAX_SENDS = 3;
const WINDOW_MS = 10 * 60 * 1000;

/** Send counts per address. Kept in memory, so it only slows spam on a serverless host. */
const sends = new Map<string, { count: number; resetAt: number }>();

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const clientAddress = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

/** Counts this send and says whether the address is over its limit. */
function overLimit(address: string) {
  const now = Date.now();
  const entry = sends.get(address);
  if (!entry || now > entry.resetAt) {
    sends.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_SENDS;
}

export async function POST(request: Request) {
  if (!feedbackConfigured()) {
    return json({ message: "ระบบรับความคิดเห็นยังไม่ได้ตั้งค่าบนเซิร์ฟเวอร์" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: "ข้อมูลที่ส่งมาไม่ถูกต้อง" }, 400);
  }

  // The hidden field is empty for a person; a bot that fills it gets a quiet "ok" and nothing is saved.
  if (typeof body.website === "string" && body.website !== "") return json({ ok: true });

  if (overLimit(clientAddress(request))) {
    return json({ message: "ส่งบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" }, 429);
  }

  const input = checkFeedback(body);
  if (!input.ok) return json({ message: input.message }, 400);

  if (!(await saveFeedback(input.value))) {
    return json({ message: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, 502);
  }
  return json({ ok: true });
}
