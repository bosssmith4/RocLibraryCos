import { NextResponse } from "next/server";
import { devToolsEnabled, drawIdOf, loadDraw, mergeFetched, saveDraw } from "@/data/commentDraw";
import type { CommentDrawFile, EntrantEdit, Server } from "@/types/commentDraw";
import { drawPool, matchPastedNames, parsePastedComments, readComments } from "@/utils/commentDraw";
import { fetchPostComments, parsePostId } from "@/utils/facebookComments";

/**
 * Dev only: every change to a Comment draw. The body's "action" picks one:
 * fetch, paste (Facebook names), review, win, reset-winners. Answers 404 on a production build.
 */
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const SERVERS: Server[] = ["Baphomet", "Moonlight"];
const text = (value: unknown) => (typeof value === "string" ? value : "");

function readEdit(raw: unknown): EntrantEdit | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const edit: EntrantEdit = {};
  if (typeof r.facebookName === "string") edit.facebookName = r.facebookName.trim();
  if (typeof r.characterName === "string") edit.characterName = r.characterName.trim();
  if (typeof r.cCode === "string") edit.cCode = r.cCode.trim();
  if (SERVERS.includes(r.server as Server)) edit.server = r.server as Server;
  return Object.keys(edit).length > 0 ? edit : undefined;
}

async function existing(id: string): Promise<CommentDrawFile> {
  const file = await loadDraw(id);
  if (!file) throw new Error("ไม่พบ Comment draw นี้ ลองดึงคอมเมนต์ใหม่");
  return file;
}

export async function POST(request: Request) {
  if (!devToolsEnabled) return json({ error: "Not found" }, 404);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Bad request" }, 400);

  try {
    switch (body.action) {
      case "fetch": {
        if (!text(body.post).trim()) return json({ error: "ใส่ลิงก์หรือ id ของโพสต์" }, 400);
        const postId = parsePostId(body.post);
        const id = drawIdOf(postId);
        const post = await fetchPostComments(postId);
        const file = mergeFetched(post, await loadDraw(id), text(body.title));
        await saveDraw(id, file);
        return json({ id, file });
      }

      case "paste": {
        const id = text(body.id);
        const file = await existing(id);
        const pasted = parsePastedComments(text(body.text));
        if (pasted.length === 0) {
          return json({ error: "ไม่เจอคอมเมนต์ในข้อความที่วาง ลองก็อปให้ติดชื่อคนคอมเมนต์มาด้วย" }, 400);
        }
        const names = matchPastedNames(file.comments, pasted);
        for (const c of file.comments) {
          const name = names.get(c.id);
          if (name) c.facebookName = name;
        }
        await saveDraw(id, file);
        const pastedComments = pasted.filter((p) => !p.author).length;
        return json({ id, file, matched: names.size, pasted: pastedComments });
      }

      case "review": {
        const id = text(body.id);
        const file = await existing(id);
        const comment = file.comments.find((c) => c.id === body.commentId);
        if (!comment) return json({ error: "ไม่พบคอมเมนต์นี้" }, 400);
        if ("edit" in body) {
          const edit = readEdit(body.edit);
          if (edit) comment.edit = edit;
          else delete comment.edit;
        }
        if (body.review === "count" || body.review === "skip") comment.review = body.review;
        else if (body.review === null) delete comment.review;
        await saveDraw(id, file);
        return json({ id, file });
      }

      case "win": {
        const id = text(body.id);
        const award = text(body.award).trim();
        if (!award) return json({ error: "ใส่ชื่อรางวัลก่อนสุ่ม" }, 400);
        const file = await existing(id);
        const entrant = drawPool(file, readComments(file)).find((e) => e.commentId === body.commentId);
        if (!entrant) return json({ error: "คนนี้ไม่อยู่ในกองสุ่มแล้ว ลองรีเฟรชหน้า" }, 409);
        file.winners.push({ ...entrant, award, at: new Date().toISOString() });
        await saveDraw(id, file);
        return json({ id, file });
      }

      case "reset-winners": {
        const id = text(body.id);
        const file = await existing(id);
        file.winners = [];
        await saveDraw(id, file);
        return json({ id, file });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
}
