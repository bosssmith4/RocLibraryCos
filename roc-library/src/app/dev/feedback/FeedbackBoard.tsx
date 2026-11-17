"use client";
import { CheckCircle2, MessageSquareText, Undo2, UserRound } from "lucide-react";
import NoteBoard from "@/components/dev/NoteBoard";
import type { FeedbackRow } from "@/utils/feedbackLimits";
import { thaiDateTime } from "@/utils/mvpRespawn";

/** The dev's board of Feedback messages: ten notes a page, each tickable once read. */
export default function FeedbackBoard() {
  return (
    <NoteBoard<FeedbackRow>
      endpoint="/api/dev/feedback"
      here="/dev/feedback"
      title="ข้อความจากผู้เล่น"
      icon={<MessageSquareText aria-hidden className="h-7 w-7 text-primary" />}
      description="ข้อความที่ผู้เล่นส่งจากหน้า “บอกเรา” ติ๊กถูกเมื่ออ่านแล้ว เปิดได้เฉพาะเครื่องนี้ตอนรัน dev"
      labels={{ open: "ยังไม่อ่าน", done: "อ่านแล้ว" }}
      empty={{ open: "ไม่มีข้อความที่ยังไม่อ่าน", done: "ยังไม่มีข้อความที่อ่านแล้ว", all: "ยังไม่มีใครส่งข้อความเข้ามา" }}
      setupHint="ถ้ายังไม่ได้เพิ่มคอลัมน์ read_at ให้รัน supabase/feedback.sql ใน Supabase ก่อน"
      renderNote={(row, { busy, onMark, showName }) => <Note row={row} busy={busy} onMark={onMark} showName={showName} />}
    />
  );
}

interface NoteProps {
  row: FeedbackRow;
  busy: boolean;
  onMark: (done: boolean) => void;
  showName: (name: string | null) => string;
}

/** One message as a sticky note: warm while unread, plain and checked once read. */
function Note({ row, busy, onMark, showName }: NoteProps) {
  const read = row.readAt !== null;

  return (
    <article
      className={`flex h-full flex-col gap-3 rounded-xl border p-4 shadow-sm ${
        read ? "border-base-300 bg-base-200" : "border-warning/50 bg-warning/15"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-base-100 text-base-content/70">
          <UserRound aria-hidden className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold leading-tight text-base-content">{showName(row.name)}</h2>
          <p className="text-sm text-base-content/70">{thaiDateTime(row.createdAt)}</p>
        </div>
        {read && <span className="badge badge-success shrink-0">อ่านแล้ว</span>}
      </div>

      <p className="whitespace-pre-wrap break-words rounded-lg bg-base-100 p-3 text-base-content">{row.message}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-base-content/10 pt-3">
        <p className="min-w-0 flex-1 text-xs text-base-content/70">
          {row.readAt ? `อ่านเมื่อ ${thaiDateTime(row.readAt)}` : "ยังไม่ได้อ่าน"}
        </p>
        {read ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-10 gap-1"
            disabled={busy}
            onClick={() => onMark(false)}
          >
            <Undo2 aria-hidden className="h-4 w-4" /> ย้อนกลับเป็นยังไม่อ่าน
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success btn-sm min-h-10 gap-1"
            disabled={busy}
            onClick={() => onMark(true)}
          >
            <CheckCircle2 aria-hidden className="h-4 w-4" /> อ่านแล้ว
          </button>
        )}
      </div>
    </article>
  );
}
