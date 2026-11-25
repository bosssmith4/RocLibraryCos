"use client";
import { useEffect, useState } from "react";
import {
  ADD_CLASS,
  DEL_CLASS,
  FIELD_LABEL,
  diffLine,
  readableLine,
  type DiffPart,
  type FieldChange,
  type ItemChange,
} from "@/utils/itemChanges";
import { unmarkedAfter } from "./detail-convert";
import type { PatchItemsDto } from "@/types/patch";

/** Item id → what the patch changed in it; empty until loaded, and when the file is missing. */
export function useItemChanges() {
  const [changes, setChanges] = useState<Record<string, ItemChange>>({});
  useEffect(() => {
    let cancelled = false;
    fetch("/assets/json/PatchItemChanges.json")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, ItemChange>) => {
        if (!cancelled) setChanges(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return changes;
}

const same = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b);

/** The field of an item that the card's description marks itself. */
export const descriptionChange = (change?: ItemChange) =>
  change?.changes.find((c) => c.field === "identifiedDescriptionName");

type Row = { label: string; parts: DiffPart[][] };

function rowsFor(c: FieldChange, lines: string[]): Row {
  const label = FIELD_LABEL[c.field] ?? c.field;
  const out: DiffPart[][] = [];
  for (let i = 0; i < Math.max(c.before.length, lines.length); i++) {
    out.push(diffLine(readableLine(c.before[i] ?? ""), readableLine(lines[i] ?? "")));
  }
  return { label, parts: out };
}

/**
 * Change note, the part below the card: the changed values the card itself does not show,
 * with old text struck through and new text highlighted. It is on screen only.
 */
export default function ChangeNote({
  item,
  change,
}: {
  item: PatchItemsDto;
  change?: ItemChange;
}) {
  if (!change) return null;
  const description = descriptionChange(change);
  const rows: Row[] = [];
  for (const c of change.changes) {
    if (c.field === "identifiedDescriptionName") {
      const rest = unmarkedAfter(item.identifiedDescriptionName, c);
      if (rest.length) {
        rows.push(
          rowsFor(
            { ...c, before: c.before.filter((_, i) => rest.includes(c.after[i] ?? "")) },
            rest,
          ),
        );
      }
      continue;
    }
    // The unidentified description repeats the identified one when both changed the same way.
    if (
      c.field === "unidentifiedDescriptionName" &&
      description &&
      same(c.before, description.before) &&
      same(c.after, description.after)
    ) {
      continue;
    }
    rows.push(rowsFor(c, c.after));
  }
  if (rows.length === 0) return null;

  return (
    <aside className="mt-3 rounded-box border border-base-300 bg-base-100 p-4 text-sm">
      <h3 className="mb-2 font-bold text-base-content">ค่าอื่นที่แก้ไขใน patch นี้</h3>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-base-content/60">{row.label}</dt>
            <dd className="wrap-break-word leading-7 text-base-content">
              {row.parts.map((parts, i) => (
                <div key={i}>
                  {parts.map((p, k) => (
                    <span
                      key={k}
                      className={
                        p.kind === "del" ? DEL_CLASS : p.kind === "add" ? ADD_CLASS : ""
                      }
                    >
                      {p.text}
                    </span>
                  ))}
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
