import {
  diffLine,
  diffToHtml,
  readableLine,
  removedToHtml,
  stripColors,
  type FieldChange,
} from "@/utils/itemChanges";

// RO colour codes are written for the game's dark tooltip. The card is light,
// so each one maps to a darker shade of the same hue that stays readable.
const RO_COLOR_CLASS: Record<string, string> = {
  ff0000: "text-[#c80000]",
  b4b4b4: "text-[#6b6b6b]",
  "00ff00": "text-[#0b7a0b]",
  ffff00: "text-[#8a6d00]",
  "32CD32": "text-[#1b7f1b]",
  "4D4DFF": "text-[#3333cc]",
  "000088": "text-[#000088]",
  CC3D3D: "text-[#b02f2f]",
  "ffffff_": "text-base-content",
};

/**
 * The new lines of a change that the description cannot mark, because the card draws
 * them elsewhere (below "ประเภท :") or not at all. The Change note lists these.
 */
export function unmarkedAfter(text: string[], change: FieldChange): string[] {
  const marked = new Set<number>();
  for (const f of text ?? []) {
    if (f.includes("ประเภท :")) break;
    const at = change.after.indexOf(stripColors(f).trim());
    if (at >= 0) marked.add(at);
  }
  return change.after.filter((_, i) => !marked.has(i));
}

/**
 * The card's lines with the patch's changes marked: old text struck through, new text
 * highlighted. A line is matched to its change by its text without colour codes; old
 * lines the patch removed outright come last.
 */
function parseDetail(text: string[], change?: FieldChange): string {
  if (!text) return "";
  const textDesc: string[] = [];

  for (let f of text) {
    const at = change ? change.after.indexOf(stripColors(f).trim()) : -1;
    if (change && at >= 0) {
      const before = change.before[at] ?? "";
      textDesc.push(
        diffToHtml(diffLine(readableLine(before), readableLine(change.after[at]))) +
          "<br>",
      );
      continue;
    }

    // A grey segment keeps only the text after its marker.
    const gray = f.split("^b4b4b4");
    if (gray.length > 1) {
      f = `<span class="${RO_COLOR_CLASS.b4b4b4}">${gray[1]}</span>`;
    }

    if (f === "" || f === "_") {
      textDesc.push('<hr class="my-2 border-base-300" />');
      continue;
    }

    // RO colour codes -> HTML
    f = f
      .replace(/\^start_L/g, `<span class="${RO_COLOR_CLASS.ff0000} line-through mr-2">`)
      .replace(/\^end_L/g, `</span>`);
    for (const [code, cls] of Object.entries(RO_COLOR_CLASS)) {
      f = f.replace(new RegExp(`\\^${code}`, "g"), `<span class="${cls}">`);
    }

    // Close any span opened by a colour code at the end of the line.
    if (f.includes("<span")) {
      f += "</span>";
    }

    if (f.includes("ประเภท :")) {
      break;
    }
    textDesc.push(f + "<br>");
  }
  // Old lines with no new line to pair with were removed by the patch.
  if (change) {
    for (const line of change.before.slice(change.after.length)) {
      textDesc.push(removedToHtml(line));
    }
  }
  return textDesc.join("");
}

export default function DetailConvertPage({
  identifiedDescription,
  change,
}: {
  identifiedDescription: string[];
  /** The patch's change to this description, drawn as marks in the text. */
  change?: FieldChange;
}) {
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-4 text-left text-base-content shadow-md @lg:p-6">
      <h3 className="mb-3 border-b border-orange-200 pb-1 text-xl font-extrabold text-orange-700">
        รายละเอียด
      </h3>

      <div
        className="wrap-break-word text-sm leading-7 text-base-content"
        dangerouslySetInnerHTML={{
          __html: parseDetail(identifiedDescription, change),
        }}
      />
    </section>
  );
}
