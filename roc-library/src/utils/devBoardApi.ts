import { NextResponse } from "next/server";
import { devToolsEnabled } from "@/data/commentDraw";
import { onThisComputer, type BoardPage, type BoardStatus } from "@/utils/devBoard";

/**
 * The GET (read a page) and PATCH (tick or untick) handlers of a dev note board's API. They answer 404
 * on a production build, and to any address that is not this computer.
 */
const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const STATUSES: BoardStatus[] = ["open", "done", "all"];

interface Source<T> {
  list: (
    status: BoardStatus,
    page: number,
  ) => Promise<{ ok: true; value: BoardPage<T> } | { ok: false; message: string }>;
  set: (id: number, done: boolean) => Promise<boolean>;
}

export function devBoardApi<T>(source: Source<T>) {
  const allowed = (request: Request) => devToolsEnabled && onThisComputer(request.headers.get("host"));

  return {
    async GET(request: Request) {
      if (!allowed(request)) return json({ message: "Not found" }, 404);
      const params = new URL(request.url).searchParams;
      const status = STATUSES.find((s) => s === params.get("status")) ?? "open";
      const page = Number.parseInt(params.get("page") ?? "1", 10);

      const result = await source.list(status, Number.isFinite(page) ? page : 1);
      if (!result.ok) return json({ message: result.message }, 502);
      return json({ ...result.value });
    },

    async PATCH(request: Request) {
      if (!allowed(request)) return json({ message: "Not found" }, 404);
      const body = await request.json().catch(() => null);
      if (!body || typeof body.id !== "number" || typeof body.done !== "boolean") {
        return json({ message: "Bad request" }, 400);
      }
      if (!(await source.set(body.id, body.done))) return json({ message: "บันทึกไม่สำเร็จ" }, 502);
      return json({ ok: true });
    },
  };
}
