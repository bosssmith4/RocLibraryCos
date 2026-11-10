import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CommentDrawFile, DrawComment } from "@/types/commentDraw";
import type { FacebookPost } from "@/utils/facebookComments";

/**
 * Comment draws, one file per post in dev-data/comment-draw (gitignored, outside src so no
 * build can bundle them). Only `next dev` reads or writes them.
 */
const DIR = path.join(process.cwd(), "dev-data", "comment-draw");
export const devToolsEnabled = process.env.NODE_ENV !== "production";

const fileOf = (id: string) => {
  // The id comes from the page address, so it must not reach outside the folder.
  if (!/^fb-[\d-]+$/.test(id)) throw new Error(`Comment draw id ไม่ถูกต้อง: ${id}`);
  return path.join(DIR, `${id}.json`);
};

export const drawIdOf = (postId: string) => `fb-${postId.replace("_", "-")}`;

export async function listDraws(): Promise<{ id: string; title: string; comments: number }[]> {
  if (!devToolsEnabled) return [];
  const names = await readdir(DIR).catch(() => [] as string[]);
  const draws = await Promise.all(
    names
      .filter((n) => n.endsWith(".json"))
      .map(async (n) => {
        const id = n.slice(0, -5);
        const file = await loadDraw(id);
        return file ? { id, title: file.title, comments: file.comments.length } : null;
      }),
  );
  return draws.filter((d) => d !== null);
}

export async function loadDraw(id: string): Promise<CommentDrawFile | null> {
  if (!devToolsEnabled) return null;
  try {
    return JSON.parse(await readFile(fileOf(id), "utf8")) as CommentDrawFile;
  } catch {
    return null;
  }
}

export async function saveDraw(id: string, file: CommentDrawFile) {
  await mkdir(DIR, { recursive: true });
  await writeFile(fileOf(id), `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

/**
 * Builds the draw from a fresh fetch. What the developer added to a comment (Facebook name,
 * edits, review) is kept by comment id, and so are the Winners; comments no longer on the post drop out.
 */
export function mergeFetched(
  post: FacebookPost,
  previous: CommentDrawFile | null,
  title?: string,
): CommentDrawFile {
  const pageId = post.id.split("_")[0];
  const before = new Map(previous?.comments.map((c) => [c.id, c]));
  const comments: DrawComment[] = post.comments.map((c) => {
    const old = before.get(c.id);
    return {
      id: c.id,
      message: c.message,
      createdTime: c.createdTime,
      ...(c.from?.id === pageId ? { fromPage: true } : {}),
      ...(old?.facebookName ? { facebookName: old.facebookName } : {}),
      ...(old?.edit ? { edit: old.edit } : {}),
      ...(old?.review ? { review: old.review } : {}),
    };
  });
  const headline = post.message.split("\n")[0].trim().slice(0, 60);

  return {
    postId: post.id,
    title: title?.trim() || previous?.title || headline || post.id,
    ...(post.permalink ? { source: post.permalink } : {}),
    fetchedAt: new Date().toISOString(),
    comments,
    winners: previous?.winners ?? [],
  };
}
