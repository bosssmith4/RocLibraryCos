"use client";

import { useState } from "react";
import type { EntrantEdit, ReadComment, Server } from "@/types/commentDraw";
import { normaliseCode } from "@/utils/commentDraw";
import { SERVER_STYLE } from "./serverStyle";

interface Props {
  read: ReadComment;
  /** For a repeat: the earlier comment it repeats. */
  first?: ReadComment;
  busy: boolean;
  onReview: (review: "count" | "skip" | null, edit?: EntrantEdit | null) => void;
}

const time = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** One comment under review, or one Entrant, with its count / skip buttons and an edit form. */
export default function CommentRow({ read, first, busy, onReview }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    facebookName: read.facebookName,
    characterName: read.characterName,
    cCode: read.cCode,
    server: read.server ?? "",
  });
  const complete = Boolean(read.facebookName && read.cCode && read.server);
  const review = read.comment.review;

  const save = () => {
    const edit: EntrantEdit = {
      facebookName: form.facebookName,
      characterName: form.characterName,
      cCode: form.cCode,
      ...(form.server ? { server: form.server as Server } : {}),
    };
    // Counting needs a Facebook name, a C-Code and a server; anything less stays unreviewed.
    const ready = Boolean(form.facebookName.trim() && normaliseCode(form.cCode) && form.server);
    onReview(ready ? "count" : null, edit);
    setEditing(false);
  };

  return (
    <li className="space-y-2 rounded-box border border-base-300 bg-base-100 p-3">
      {first && (
        <p className="rounded-md bg-base-200 px-2 py-1 text-xs text-base-content/70">
          คอมเมนต์แรก ({time(first.comment.createdTime)}): <b>{first.facebookName || "?"}</b> ·{" "}
          {first.characterName || "-"} ({first.cCode || "ไม่มี C-Code"})
        </p>
      )}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 grow space-y-1">
          <p className="text-sm">
            <b className="text-base-content">{read.facebookName || "ไม่มีชื่อ Facebook"}</b>
            <span className="ml-2 text-xs text-base-content/60">{time(read.comment.createdTime)}</span>
          </p>
          <p className="whitespace-pre-line rounded-md bg-base-200 px-2 py-1 text-xs">
            {read.comment.message || "(ไม่มีข้อความ)"}
          </p>
          <p className="flex flex-wrap items-center gap-1 text-xs">
            <span>ตัวละคร: {read.characterName || "-"}</span>·<span>C-Code: {read.cCode || "-"}</span>·
            {read.server ? (
              <span className={`badge badge-xs ${SERVER_STYLE[read.server].badge}`}>{read.server}</span>
            ) : (
              <span className="text-error">ไม่ระบุเซิร์ฟ</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`badge badge-sm ${read.counts ? "badge-success" : review === "skip" ? "badge-error" : "badge-ghost"}`}
          >
            {read.counts ? "นับ" : review === "skip" ? "ไม่นับ" : "ยังไม่ตรวจ"}
          </span>
          <div className="join">
            <button
              className="btn btn-xs join-item"
              disabled={busy || !complete || review === "count"}
              title={complete ? undefined : "ต้องมีชื่อ Facebook, C-Code และเซิร์ฟเวอร์ก่อน"}
              onClick={() => onReview("count")}
            >
              นับ
            </button>
            <button
              className="btn btn-xs join-item"
              disabled={busy || review === "skip"}
              onClick={() => onReview("skip")}
            >
              ไม่นับ
            </button>
            <button className="btn btn-xs join-item" disabled={busy} onClick={() => setEditing((v) => !v)}>
              แก้ไข
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="grid gap-2 sm:grid-cols-4">
          <input
            className="input input-bordered input-sm"
            placeholder="ชื่อ Facebook"
            value={form.facebookName}
            onChange={(e) => setForm({ ...form, facebookName: e.target.value })}
          />
          <input
            className="input input-bordered input-sm"
            placeholder="ชื่อตัวละคร"
            value={form.characterName}
            onChange={(e) => setForm({ ...form, characterName: e.target.value })}
          />
          <input
            className="input input-bordered input-sm"
            placeholder="C-Code เช่น 186-253"
            value={form.cCode}
            onChange={(e) => setForm({ ...form, cCode: e.target.value })}
          />
          <select
            className="select select-bordered select-sm"
            value={form.server}
            onChange={(e) => setForm({ ...form, server: e.target.value })}
          >
            <option value="">เลือกเซิร์ฟเวอร์</option>
            <option value="Baphomet">Baphomet</option>
            <option value="Moonlight">Moonlight</option>
          </select>
          <div className="flex gap-2 sm:col-span-4">
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={save}>
              บันทึก
            </button>
            {read.comment.edit && (
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onReview(null, null)}>
                ใช้ค่าที่อ่านจากคอมเมนต์
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
