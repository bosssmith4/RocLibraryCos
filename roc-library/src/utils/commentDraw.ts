import type {
  CommentDrawFile,
  DrawWinner,
  Entrant,
  HeldReason,
  ReadComment,
  Server,
} from "@/types/commentDraw";

/**
 * The rules of a Comment draw: reading a comment's C-Code, server and character name, deciding
 * which comments are Entrants and which are Held, and matching the comments pasted out of
 * Facebook to the fetched ones. Pure, so the server and the page agree.
 */

// 3-4 digits, a dash, 3 digits ("186-253", "0048-051"); spaces around the dash are allowed.
const DASHED = /(?<!\d)(\d{3,4})\s*-\s*(\d{3})(?!\d)/g;
// 6-7 digits written without a dash ("839977").
const PLAIN = /(?<!\d)(\d{3,4})(\d{3})(?!\d)/;
// Labels players put before a C-Code: "C-Code", "[C-code]", "C CODE", "C-coad", "cc", "Code".
const CODE_LABEL = /[[(]?\s*(?:c\s*-?\s*co(?:de|ad)|cc|code)\s*[\])]?\s*[:.\-\s]*[[(]?\s*$/i;
// Labels players put before a character name.
const NAME_LABEL = /^(?:ชื่อตัวละคร|ชื่อในเกม(?:ส์)?|ชื่อ|name)\s*[.:：]?\s*/i;

/** Normalises a C-Code to "xxx-xxx" / "xxxx-xxx", or "" when the text holds none. */
export function normaliseCode(text: string): string {
  return findCode(text)?.code ?? "";
}

function findCode(text: string): { code: string; index: number } | undefined {
  const dashed = [...text.matchAll(DASHED)];
  if (dashed.length > 0) {
    // A name can hold digits too; the one after a "code" label is the C-Code.
    const label = text.search(/co(?:de|ad)|cc/i);
    const m = dashed.find((d) => label >= 0 && d.index >= label) ?? dashed[0];
    return { code: `${m[1]}-${m[2]}`, index: m.index };
  }
  const plain = text.match(PLAIN);
  if (plain?.index !== undefined) return { code: `${plain[1]}-${plain[2]}`, index: plain.index };
  return undefined;
}

/** Reads the server, forgiving short forms and clear typos ("BA4", "บาโฟ", "Balhomet", "Moon"). */
export function readServer(text: string): Server | undefined {
  const bapho = text.search(/ba[lp]h?o|บาโฟ|ba4/i);
  const moon = text.search(/moon|มูน/i);
  if (bapho < 0 && moon < 0) return undefined;
  if (moon < 0) return "Baphomet";
  if (bapho < 0) return "Moonlight";
  // Both appear: the later one is usually the server line, the earlier one part of the name.
  return bapho > moon ? "Baphomet" : "Moonlight";
}

/** The character name: the text before the C-Code, with labels such as "ชื่อ :" or "C-Code" removed. */
export function readCharacterName(text: string): string {
  const found = findCode(text);
  const before = found ? text.slice(0, found.index) : text.split("\n")[0];
  const lines = before
    .replace(CODE_LABEL, "")
    .split(/\n|\s\/\s/)
    .map((line) =>
      line
        .trim()
        .replace(/^-(?:\s+|$)/, "")
        .replace(NAME_LABEL, "")
        .replace(/[\s/|,(]+$/, "")
        .trim(),
    )
    .filter(Boolean);
  return lines.at(-1) ?? "";
}

const byTime = (a: { createdTime: string }, b: { createdTime: string }) =>
  a.createdTime.localeCompare(b.createdTime);

/** Reads every comment of a draw (oldest first, the Page's own left out) and applies the rules. */
export function readComments(file: CommentDrawFile): ReadComment[] {
  const firstByCode = new Map<string, string>();
  const firstByName = new Map<string, string>();

  return file.comments
    .filter((c) => !c.fromPage)
    .sort(byTime)
    .map((comment) => {
      const edit = comment.edit ?? {};
      const facebookName = (edit.facebookName ?? comment.facebookName ?? "").trim();
      const characterName = edit.characterName ?? readCharacterName(comment.message);
      const cCode = edit.cCode !== undefined ? normaliseCode(edit.cCode) : normaliseCode(comment.message);
      const server = edit.server ?? readServer(comment.message);

      const reasons: HeldReason[] = [];
      let firstId: string | undefined;
      if (!cCode) reasons.push("no-code");
      if (!server) reasons.push("no-server");
      if (!facebookName) reasons.push("no-facebook-name");
      if (cCode) {
        const sameCode = firstByCode.get(cCode);
        if (sameCode) {
          reasons.push("duplicate-code");
          firstId = sameCode;
        } else firstByCode.set(cCode, comment.id);
        // Only comments with a C-Code count as a person's entry, so chatting first is no repeat.
        if (facebookName) {
          const key = facebookName.toLowerCase();
          const sameName = firstByName.get(key);
          if (sameName) {
            reasons.push("duplicate-name");
            firstId ??= sameName;
          } else firstByName.set(key, comment.id);
        }
      }

      const complete = Boolean(cCode && server && facebookName);
      const counts =
        comment.review === "skip" ? false : comment.review === "count" ? complete : reasons.length === 0;

      return { comment, facebookName, characterName, cCode, server, reasons, firstId, counts };
    });
}

export function toEntrant(read: ReadComment): Entrant {
  return {
    commentId: read.comment.id,
    facebookName: read.facebookName,
    characterName: read.characterName,
    cCode: read.cCode,
    server: read.server as Server,
  };
}

/** Entrants not drawn yet. */
export function drawPool(file: CommentDrawFile, read: ReadComment[] = readComments(file)): Entrant[] {
  const won = new Set(file.winners.map((w) => w.commentId));
  return read.filter((r) => r.counts && !won.has(r.comment.id)).map(toEntrant);
}

/** Winners as text to post, grouped by Award in the order drawn. */
export function winnersText(winners: DrawWinner[]): string {
  const groups = new Map<string, DrawWinner[]>();
  for (const w of winners) groups.set(w.award, [...(groups.get(w.award) ?? []), w]);
  return [...groups]
    .map(
      ([award, list]) =>
        `🎁 ${award}\n` +
        list
          .map(
            (w, i) =>
              `${i + 1}. ${w.facebookName}\n   ${w.characterName || "-"} (${w.cCode}) ${w.server}`,
          )
          .join("\n"),
    )
    .join("\n\n");
}

// ---- Comments pasted out of Facebook ----

/** Lines Facebook puts around a comment that are not its text. */
const FACEBOOK_CHROME = new Set([
  "·",
  "ตอบกลับ",
  "ส่งข้อความ",
  "ซ่อน",
  "ดูคำแปล",
  "แก้ไขแล้ว",
  "แฟนหน้าใหม่",
  "แฟนตัวยง",
  "ผู้เขียน",
  "ผู้ติดตามดีเด่น",
  "Reply",
  "Message",
  "Hide",
  "See translation",
  "Edited",
  "Author",
  "Top fan",
  "Rising fan",
]);

export interface PastedComment {
  facebookName: string;
  text: string;
  /** Written by the post's author (the Page). */
  author: boolean;
}

/**
 * Splits the text of a post's comments, as selected and copied in a browser, into one entry per
 * comment. A comment starts with the writer's name on its own line followed by a "·" line, and
 * its text runs until the "ตอบกลับ" (Reply) line.
 */
export function parsePastedComments(paste: string): PastedComment[] {
  const lines = paste.split(/\r?\n/).map((l) => l.trim());
  const nextFilled = (from: number) => {
    for (let i = from; i < lines.length; i++) if (lines[i]) return i;
    return -1;
  };

  const result: PastedComment[] = [];
  let i = 0;
  while (i < lines.length) {
    const next = nextFilled(i + 1);
    const startsComment = lines[i] && lines[i] !== "·" && next >= 0 && lines[next] === "·";
    if (!startsComment) {
      i++;
      continue;
    }
    const facebookName = lines[i];
    let author = false;
    const text: string[] = [];
    let j = next;
    // Skip the "·" lines and badges between the name and the text.
    for (; j < lines.length && (!lines[j] || FACEBOOK_CHROME.has(lines[j])); j++) {
      if (lines[j] === "ผู้เขียน" || lines[j] === "Author") author = true;
    }
    for (; j < lines.length && lines[j] !== "ตอบกลับ" && lines[j] !== "Reply"; j++) {
      if (lines[j]) text.push(lines[j]);
    }
    result.push({
      facebookName,
      author,
      text: text
        .join("\n")
        .replace(/\s*(?:\.\.\.|…)\s*(?:ดูเพิ่มเติม|See more)\s*$/i, "")
        .trim(),
    });
    i = j + 1;
  }
  return result;
}

const squash = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/**
 * Gives each comment the Facebook name of the pasted comment whose (possibly shortened) text it
 * starts with. Returns the names by comment id; comments with no match are left out.
 */
export function matchPastedNames(
  comments: { id: string; message: string; fromPage?: boolean }[],
  pasted: PastedComment[],
): Map<string, string> {
  const pool = pasted
    .filter((p) => !p.author && p.text)
    .map((p) => ({ ...p, key: squash(p.text), used: false }));
  const names = new Map<string, string>();
  for (const c of comments) {
    if (c.fromPage) continue;
    const text = squash(c.message);
    // The longest matching text wins, so "++" never takes a comment that only starts with it.
    const hit = pool
      .filter((p) => !p.used && p.key && text.startsWith(p.key))
      .sort((a, b) => b.key.length - a.key.length)[0];
    if (hit) {
      hit.used = true;
      names.set(c.id, hit.facebookName);
    }
  }
  return names;
}
