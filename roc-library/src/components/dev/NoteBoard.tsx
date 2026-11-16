"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { DEV_BOARDS, type BoardPage, type BoardStatus } from "@/utils/devBoard";

interface NoteBoardProps<T extends { id: number }> {
  /** the board's API, such as "/api/dev/feedback" */
  endpoint: string;
  /** this board's address, so its tab is marked */
  here: string;
  title: string;
  icon: ReactNode;
  description: string;
  /** what the three filters and the empty list say: open (not handled), done (ticked) */
  labels: { open: string; done: string };
  empty: Record<BoardStatus, string>;
  /** what to try when the table cannot be read */
  setupHint: string;
  /** one note; call onMark(true) to tick it and onMark(false) to untick */
  renderNote: (row: T, control: { busy: boolean; onMark: (done: boolean) => void }) => ReactNode;
}

type Loaded<T> = { key: string; data?: BoardPage<T>; error?: string };

/** A dev-only board of sticky notes: ten a page, filtered to open, done or all, each tickable. */
export default function NoteBoard<T extends { id: number }>({
  endpoint,
  here,
  title,
  icon,
  description,
  labels,
  empty,
  setupHint,
  renderNote,
}: NoteBoardProps<T>) {
  const [status, setStatus] = useState<BoardStatus>("open");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T>>();
  const [busy, setBusy] = useState<number>();
  const [saveError, setSaveError] = useState("");

  const key = `${status}:${page}:${refresh}`;
  const loading = loaded?.key !== key;

  useEffect(() => {
    let alive = true;
    fetch(`${endpoint}?status=${status}&page=${page}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message ?? "อ่านข้อมูลไม่สำเร็จ");
        return body as BoardPage<T>;
      })
      .then((data) => {
        if (!alive) return;
        setLoaded({ key, data });
        // the last page may be gone after ticking its only note
        if (data.page !== page) setPage(data.page);
      })
      .catch((e: unknown) => {
        if (alive) setLoaded({ key, error: e instanceof Error ? e.message : "อ่านข้อมูลไม่สำเร็จ" });
      });
    return () => {
      alive = false;
    };
  }, [key, endpoint, status, page]);

  const chooseStatus = (next: BoardStatus) => {
    setStatus(next);
    setPage(1);
  };

  async function mark(id: number, done: boolean) {
    setBusy(id);
    setSaveError("");
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "บันทึกไม่สำเร็จ");
      setRefresh((n) => n + 1);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(undefined);
    }
  }

  const data = loaded?.data;
  const filters: { id: BoardStatus; label: string }[] = [
    { id: "open", label: labels.open },
    { id: "done", label: labels.done },
    { id: "all", label: "ทั้งหมด" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="หน้า dev" className="flex flex-wrap gap-2">
        {DEV_BOARDS.map((board) => (
          <Link
            key={board.href}
            href={board.href}
            aria-current={board.href === here ? "page" : undefined}
            className={`btn btn-sm min-h-10 ${board.href === here ? "btn-neutral" : "btn-ghost border-base-300"}`}
          >
            {board.label}
          </Link>
        ))}
      </nav>

      <header className="space-y-1">
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-base-content sm:text-3xl">
          {icon} {title}
          <span className="badge badge-warning">DEV</span>
        </h1>
        <p className="text-base-content/70">{description}</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="join" role="group" aria-label="กรอง">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={status === id}
              className={`btn join-item min-h-11 gap-2 ${status === id ? "btn-primary" : "btn-outline"}`}
              onClick={() => chooseStatus(id)}
            >
              {label}
              {data && <span className="font-normal opacity-80">{data.counts[id]}</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-11 gap-2"
          onClick={() => setRefresh((n) => n + 1)}
          disabled={loading}
        >
          <RefreshCw aria-hidden className={`h-4 w-4 ${loading ? "motion-safe:animate-spin" : ""}`} /> โหลดใหม่
        </button>
        {data && (
          <p role="status" className="ml-auto text-sm text-base-content/70">
            หน้า {data.page} / {data.pages}
          </p>
        )}
      </div>

      {saveError && (
        <p role="alert" className="alert alert-error text-sm">
          {saveError}
        </p>
      )}

      {loaded?.error ? (
        <div role="alert" className="alert alert-error flex-col items-start gap-1 text-sm">
          <p className="font-semibold">อ่านข้อมูลไม่ได้: {loaded.error}</p>
          <p>{setupHint}</p>
        </div>
      ) : !data ? (
        <p className="py-12 text-center text-base-content/70">กำลังโหลด…</p>
      ) : data.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-300 bg-base-100 py-16 text-center text-base-content/70">
          {empty[status]}
        </p>
      ) : (
        <ul className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          {data.rows.map((row) => (
            <li key={row.id}>{renderNote(row, { busy: busy === row.id, onMark: (done) => mark(row.id, done) })}</li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <nav aria-label="หน้าถัดไป" className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn btn-outline min-h-11 gap-1"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft aria-hidden className="h-4 w-4" /> ก่อนหน้า
          </button>
          <span className="text-sm text-base-content/70">
            {data.page} / {data.pages}
          </span>
          <button
            type="button"
            className="btn btn-outline min-h-11 gap-1"
            disabled={page >= data.pages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            ถัดไป <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
