/** One field of an item that the patch changed, as PatchItemChanges.json lists it. */
export interface FieldChange {
  field: string;
  before: string[];
  after: string[];
}

export interface ItemChange {
  name: string;
  changes: FieldChange[];
}

export type DiffKind = "same" | "del" | "add";
export interface DiffPart {
  text: string;
  kind: DiffKind;
}

/** Player-facing labels for the fields; an unknown field shows under its own name. */
export const FIELD_LABEL: Record<string, string> = {
  identifiedDescriptionName: "คำอธิบาย",
  unidentifiedDescriptionName: "คำอธิบาย (ยังไม่ตรวจสอบ)",
  unidentifiedDisplayName: "ชื่อ (ยังไม่ตรวจสอบ)",
  unidentifiedResourceName: "Resource (ยังไม่ตรวจสอบ)",
  costume: "Costume",
};

const COLOR_CODE = /\^[0-9a-fA-F]{6}/g;

/** The text the changes file holds for a game line: no colour codes. */
export const stripColors = (line: string) => line.replace(COLOR_CODE, "");

/** A Navigation tag shows as just the name in brackets; any other text is kept as it is. */
export const readableLine = (line: string) =>
  stripColors(line).replace(/<NAVI>(.*?)<INFO>.*?<\/INFO><\/NAVI>/g, "$1");

const tokens = (s: string) => s.split(/(\s+|:)/).filter((t) => t !== "");

/**
 * Word-level comparison of an old line and its new one (split at spaces and ":").
 * When the two share less than half their text, the whole old line is struck and the
 * whole new one highlighted, which reads better than a patchwork of small marks.
 */
export function diffLine(before: string, after: string): DiffPart[] {
  const a = tokens(before);
  const b = tokens(after);
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  const push = (text: string, kind: DiffKind) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.text += text;
    else parts.push({ text, kind });
  };
  let i = 0;
  let j = 0;
  let common = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(a[i], "same");
      common += a[i].length;
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push(a[i++], "del");
    } else {
      push(b[j++], "add");
    }
  }
  while (i < a.length) push(a[i++], "del");
  while (j < b.length) push(b[j++], "add");

  if (common * 2 < Math.max(before.length, after.length)) {
    return [
      ...(before ? [{ text: before, kind: "del" as const }] : []),
      ...(after ? [{ text: after, kind: "add" as const }] : []),
    ];
  }
  return parts;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const DEL_CLASS = "text-error line-through decoration-2";
export const ADD_CLASS = "rounded bg-success/25 px-0.5 font-semibold text-[#0b6b0b]";

/** The marks as HTML for the card's description. */
export function diffToHtml(parts: DiffPart[]): string {
  return parts
    .map(({ text, kind }) => {
      const t = escapeHtml(text);
      if (kind === "del") return `<span class="${DEL_CLASS}">${t}</span>`;
      if (kind === "add") return `<span class="${ADD_CLASS}">${t}</span>`;
      return t;
    })
    .join("");
}

/** A line of the old text that the patch removed, struck through. */
export const removedToHtml = (line: string) =>
  `<span class="${DEL_CLASS}">${escapeHtml(readableLine(line))}</span><br>`;
