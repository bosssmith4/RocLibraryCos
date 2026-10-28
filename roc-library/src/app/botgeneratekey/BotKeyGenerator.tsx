"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, KeyRound, Loader2, Lock, LogOut, Trash2 } from "lucide-react";

interface LogRow {
  date: string;
  machineId: string;
  name: string;
  days: string;
}

interface Issued {
  key: string;
  expiresAt: number | null;
  row: LogRow;
}

type Status = "idle" | "busy";

const thaiDate = (seconds: number) =>
  new Date(seconds * 1000).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "long",
    timeStyle: "short",
  });

/** Same columns as the desktop tool's issued_keys.csv; the BOM lets Excel read Thai text. */
function downloadCsv(rows: LogRow[]) {
  const lines = ["date,machine_id,name,days", ...rows.map((r) => `${r.date},${r.machineId},${r.name},${r.days}`)];
  const blob = new Blob(["﻿" + lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "issued_keys.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function BotKeyGenerator({ signedIn, rows }: { signedIn: boolean; rows: LogRow[] | null }) {
  const router = useRouter();
  // The password is only kept while the sign-in modal is open; the server then remembers the visit in a cookie.
  const [password, setPassword] = useState("");
  const [machineId, setMachineId] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Issued | null>(null);
  const [copied, setCopied] = useState(false);
  // "Clear list" only hides the rows on screen; the Key record keeps them.
  const [hidden, setHidden] = useState(false);
  const history = hidden ? [] : (rows ?? []);

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/botgeneratekey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, data: await res.json() };
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError("");
    try {
      const { ok, data } = await post({ action: "login", password });
      if (!ok) setError(data.message ?? "เข้าสู่ระบบไม่สำเร็จ");
      else {
        setPassword("");
        router.refresh();
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setStatus("idle");
    }
  };

  const signOut = async () => {
    try {
      await post({ action: "logout" });
    } finally {
      setResult(null);
      router.refresh();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError("");
    setCopied(false);

    try {
      const { ok, data } = await post({ machineId, name, days });
      if (!ok) {
        setResult(null);
        setError(data.message ?? "ออกคีย์ไม่สำเร็จ");
        if (data.message?.includes("หมดเวลา")) router.refresh();
      } else {
        setResult(data);
        setHidden(false);
        router.refresh();
      }
    } catch {
      setResult(null);
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setStatus("idle");
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("คัดลอกไม่สำเร็จ กรุณาเลือกข้อความคีย์แล้วคัดลอกเอง");
    }
  };

  if (!signedIn) {
    return (
      <main className="px-4 py-6 sm:px-6">
        <dialog open aria-labelledby="sign-in-title" className="modal modal-open">
          <form onSubmit={signIn} className="modal-box space-y-4">
            <h1 id="sign-in-title" className="flex items-center gap-2 text-lg font-bold">
              <Lock aria-hidden="true" className="h-5 w-5" />
              ยืนยันตัวตนผู้ดูแล
            </h1>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">รหัสผ่านผู้ดูแล</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                autoFocus
                required
                className="input input-bordered min-h-11 w-full"
              />
            </label>
            {error && (
              <div role="alert" className="alert alert-error text-sm">
                {error}
              </div>
            )}
            <button type="submit" disabled={status === "busy"} className="btn btn-primary min-h-11 w-full gap-2">
              {status === "busy" && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
              เข้าสู่ระบบ
            </button>
            <p className="text-xs text-base-content/60">เข้าสู่ระบบแล้วใช้งานได้ 3 ชั่วโมง</p>
          </form>
        </dialog>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="relative">
          <button type="button" onClick={signOut} className="btn btn-ghost btn-sm absolute right-0 top-0 min-h-11 gap-2">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            ออกจากระบบ
          </button>
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-field bg-primary/10 px-2 py-1 text-xs font-bold tracking-widest text-primary">
            <KeyRound aria-hidden="true" className="h-3.5 w-3.5" />
            BOT LICENSE
          </p>
          <h1 className="text-2xl font-bold text-base-content sm:text-3xl">ตัวออกคีย์ Bot</h1>
          <p className="mt-1 text-sm text-base-content/70">
            วางรหัสเครื่องที่ผู้ใช้ส่งมา แล้วกดสร้างคีย์ ส่งคีย์ที่ได้กลับให้ผู้ใช้
          </p>
        </header>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-box border border-base-300 bg-base-100 p-4 sm:p-6"
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">รหัสเครื่อง</span>
            <input
              value={machineId}
              onChange={(e) => setMachineId(e.target.value.toUpperCase())}
              placeholder="A1B2C-3D4E5-F6A7B-8C9D0"
              autoComplete="off"
              spellCheck={false}
              required
              className="input input-bordered min-h-11 w-full font-mono"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">
                ชื่อผู้ใช้ <span className="font-normal text-base-content/60">(ไว้จดจำ ไม่ใส่ก็ได้)</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="off"
                className="input input-bordered min-h-11 w-full"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">
                จำนวนวันก่อนหมดอายุ <span className="font-normal text-base-content/60">(ว่าง = ถาวร)</span>
              </span>
              <input
                value={days}
                onChange={(e) => setDays(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                className="input input-bordered min-h-11 w-full"
              />
            </label>
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "busy"}
            className="btn btn-primary min-h-11 w-full gap-2"
          >
            {status === "busy" ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound aria-hidden="true" className="h-4 w-4" />
            )}
            {status === "busy" ? "กำลังสร้างคีย์..." : "สร้างคีย์"}
          </button>
        </form>

        {result && (
          <section
            aria-label="คีย์ที่สร้าง"
            className="space-y-3 rounded-box border border-success/50 bg-base-100 p-4 sm:p-6"
          >
            <p className="text-sm text-base-content/70">
              ออกให้เครื่อง <span className="font-mono font-semibold">{result.row.machineId}</span>
              {result.row.name && ` (${result.row.name})`} ·{" "}
              {result.expiresAt ? `หมดอายุ ${thaiDate(result.expiresAt)}` : "ใช้ได้ถาวร"}
            </p>
            <textarea
              readOnly
              value={result.key}
              rows={5}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="คีย์"
              className="textarea textarea-bordered w-full break-all font-mono text-xs"
            />
            <button type="button" onClick={copy} className="btn btn-outline min-h-11 gap-2">
              {copied ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Copy aria-hidden="true" className="h-4 w-4" />
              )}
              {copied ? "คัดลอกแล้ว" : "คัดลอกคีย์"}
            </button>
          </section>
        )}

        {history.length > 0 && (
          <section aria-label="ประวัติการออกคีย์" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">ประวัติการออกคีย์ ({history.length})</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadCsv([...history].reverse())}
                  className="btn btn-outline btn-sm min-h-11 gap-2"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  ดาวน์โหลด CSV
                </button>
                <button
                  type="button"
                  onClick={() => setHidden(true)}
                  className="btn btn-ghost btn-sm min-h-11 gap-2"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  ล้างรายการ
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>รหัสเครื่อง</th>
                    <th>ชื่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={`${r.date}-${r.machineId}-${i}`}>
                      <td className="whitespace-nowrap">{r.date}</td>
                      <td className="font-mono">{r.machineId}</td>
                      <td>{r.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-base-content/60">
              รายการนี้ดึงจากฐานข้อมูล “ล้างรายการ” แค่ซ่อนบนหน้านี้ ไม่ได้ลบข้อมูลจริง
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
