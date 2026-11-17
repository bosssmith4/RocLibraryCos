"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, StickyNote, Undo2 } from "lucide-react";
import NoteBoard from "@/components/dev/NoteBoard";
import MonstersDb from "@/services/mosters/mostersDb";
import { mapLinks, type MapLinks } from "@/utils/mapRoute";
import type { BossReportRow } from "@/utils/bossReportLimits";
import { thaiDateTime } from "@/utils/mvpRespawn";

const monsters = MonstersDb();

/** The dev's board of Spawn reports: ten notes a page, each tickable once the data has been fixed. */
export default function MvpReportBoard() {
  const [links, setLinks] = useState<MapLinks>();

  useEffect(() => {
    let alive = true;
    mapLinks().then((data) => {
      if (alive) setLinks(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <NoteBoard<BossReportRow>
      endpoint="/api/dev/mvp-reports"
      here="/dev/mvp-reports"
      title="รายงานข้อมูลบอส"
      icon={<StickyNote aria-hidden className="h-7 w-7 text-primary" />}
      description="บันทึกที่ผู้เล่นส่งจากปุ่ม “แจ้งข้อมูลผิด” ในหน้า MVP Hunter เปิดได้เฉพาะเครื่องนี้ตอนรัน dev"
      labels={{ open: "ยังไม่แก้", done: "แก้แล้ว" }}
      empty={{ open: "ไม่มีรายงานที่รอแก้", done: "ยังไม่มีรายงานที่แก้แล้ว", all: "ยังไม่มีใครแจ้งข้อมูลผิดเข้ามา" }}
      setupHint="ถ้ายังไม่ได้สร้างตารางหรือคอลัมน์ fixed_at ให้รัน supabase/boss_reports.sql ใน Supabase ก่อน"
      renderNote={(row, { busy, onMark, showName }) => (
        <Note row={row} links={links} busy={busy} onMark={onMark} showName={showName} />
      )}
    />
  );
}

interface NoteProps {
  row: BossReportRow;
  links: MapLinks | undefined;
  busy: boolean;
  onMark: (done: boolean) => void;
  showName: (name: string | null) => string;
}

/** One report as a sticky note: warm while it waits, plain and checked once fixed. */
function Note({ row, links, busy, onMark, showName }: NoteProps) {
  const fixed = row.fixedAt !== null;
  const monster = monsters.find((m) => m.id === row.monsterId);
  const mapName = links?.maps[row.spawnMap]?.name;

  return (
    <article
      className={`flex h-full flex-col gap-3 rounded-xl border p-4 shadow-sm ${
        fixed ? "border-base-300 bg-base-200" : "border-warning/50 bg-warning/15"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-100">
          {monster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={monster.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-tight text-base-content">{row.monsterName}</h2>
          <p className="flex items-start gap-1 text-sm text-base-content/70">
            <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {mapName ?? row.spawnMap} <span className="font-mono">({row.spawnMap})</span>
            </span>
          </p>
        </div>
        {fixed && <span className="badge badge-success shrink-0">แก้แล้ว</span>}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-base-content">{row.problem}</p>
        <p className="whitespace-pre-wrap break-words rounded-lg bg-base-100 p-3 text-base-content">{row.detail}</p>
        <p className="text-xs text-base-content/70">หน้าเว็บแสดงไว้: {row.listed}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-base-content/10 pt-3">
        <p className="min-w-0 flex-1 text-xs text-base-content/70">
          {showName(row.name)} · {thaiDateTime(row.createdAt)}
          {row.fixedAt && <span className="block">แก้เมื่อ {thaiDateTime(row.fixedAt)}</span>}
        </p>
        {fixed ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-10 gap-1"
            disabled={busy}
            onClick={() => onMark(false)}
          >
            <Undo2 aria-hidden className="h-4 w-4" /> ย้อนกลับเป็นยังไม่แก้
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success btn-sm min-h-10 gap-1"
            disabled={busy}
            onClick={() => onMark(true)}
          >
            <CheckCircle2 aria-hidden className="h-4 w-4" /> แก้ไขแล้ว
          </button>
        )}
      </div>
    </article>
  );
}
