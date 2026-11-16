"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Flag, X } from "lucide-react";
import { DETAIL_MAX, DETAIL_MIN, NAME_MAX, PROBLEMS, type ProblemId } from "@/utils/bossReportLimits";
import { formatCooldown } from "@/utils/mvpRespawn";
import type { MapSpawn } from "@/types/monster";

interface ReportModalProps {
  monsterId: number;
  mvpName: string;
  spawn: MapSpawn;
  /** the name the game gives the Spawn map, when known */
  mapName: string | undefined;
  onClose: () => void;
}

type Status = "idle" | "sending" | "sent";

/** Lets a player tell the developer that a boss's Spawn map, Respawn window or Route is wrong. */
export default function ReportModal({ monsterId, mvpName, spawn, mapName, onClose }: ReportModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [problem, setProblem] = useState<ProblemId>("map");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: people never see or fill this
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const tooShort = detail.trim().length < DETAIL_MIN;
  const hint = PROBLEMS.find((p) => p.id === problem)?.hint;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (tooShort || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/boss-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monsterId, spawnMap: spawn.map, problem, detail, name, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "ส่งไม่สำเร็จ กรุณาลองอีกครั้ง");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง");
      setStatus("idle");
    }
  }

  return createPortal(
    <dialog open aria-labelledby="mvp-report-title" className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box flex max-h-[90vh] w-[95vw] max-w-lg flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <Flag aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 id="mvp-report-title" className="text-lg font-bold leading-snug text-base-content">
              แจ้งข้อมูลไม่ตรง: {mvpName}
            </h2>
            <p className="text-sm text-base-content/70">
              {mapName ?? spawn.map} <span className="font-mono">({spawn.map})</span> ·{" "}
              {spawn.cooldown[1] === 0 ? "เกิดใหม่ทันที" : `เกิดใหม่ใน ${formatCooldown(spawn.cooldown)}`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm shrink-0"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-base-200 p-6 text-center">
            <CheckCircle2 aria-hidden className="h-8 w-8 text-success" />
            <p className="text-lg font-semibold text-base-content">ขอบคุณที่แจ้งเรา</p>
            <p className="text-sm text-base-content/70">ผู้พัฒนาจะตรวจและแก้ข้อมูลให้ในรอบถัดไป</p>
            <button type="button" className="btn btn-primary btn-sm mt-2" onClick={onClose}>
              ปิด
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-semibold text-base-content">ข้อมูลผิดตรงไหน</legend>
              {PROBLEMS.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 text-base-content">
                  <input
                    type="radio"
                    name="mvp-report-problem"
                    className="radio radio-primary radio-sm"
                    checked={problem === p.id}
                    onChange={() => setProblem(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-base-content">ที่ถูกต้องคืออะไร</span>
              <textarea
                className="textarea textarea-bordered min-h-24 w-full"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                maxLength={DETAIL_MAX}
                required
                placeholder={hint}
              />
              <span className="mt-1 block text-right text-xs text-base-content/60">
                {detail.length}/{DETAIL_MAX}
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-base-content">ชื่อ (ไม่บังคับ)</span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
              />
            </label>

            {/* Honeypot, hidden from people and screen readers */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={tooShort || status === "sending"}>
              {status === "sending" ? "กำลังส่ง…" : "ส่งให้ผู้พัฒนา"}
            </button>
          </form>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
