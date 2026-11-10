"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CommentDrawFile, EntrantEdit, HeldReason, ReadComment } from "@/types/commentDraw";
import { drawPool, readComments, toEntrant, winnersText } from "@/utils/commentDraw";
import CommentRow from "./CommentRow";
import EntrantRoller, { EntrantCard, type EntrantRollerHandle } from "./EntrantRoller";

interface Props {
  draws: { id: string; title: string; comments: number }[];
  id: string | null;
  initial: CommentDrawFile | null;
}

type Panel = "settings" | "draw";

/** Held groups in the order shown; a comment with several reasons sits in the first that applies. */
const HELD_GROUPS: { reason: HeldReason; title: string }[] = [
  { reason: "no-code", title: "ไม่มี C-Code" },
  { reason: "no-facebook-name", title: "ไม่มีชื่อ Facebook" },
  { reason: "no-server", title: "ไม่ระบุเซิร์ฟเวอร์" },
  { reason: "duplicate-code", title: "C-Code ซ้ำ" },
  { reason: "duplicate-name", title: "ชื่อ Facebook ซ้ำ" },
];

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/dev/comment-draw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as { id: string; file: CommentDrawFile; matched?: number; pasted?: number };
}

/**
 * The Comment draw page: two panels, one open at a time. Setting fetches the post, adds Facebook
 * names and reviews comments; Scroll is the Draw screen shown to the audience.
 */
export default function CommentDrawTool({ draws, id, initial }: Props) {
  const router = useRouter();
  const [file, setFile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [post, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [paste, setPaste] = useState("");
  const [award, setAward] = useState("");
  const [spinning, setSpinning] = useState(false);
  // A draw that already has Entrants opens on the Draw screen; otherwise on Setting.
  const [panel, setPanel] = useState<Panel>(() =>
    initial && readComments(initial).some((r) => r.counts) ? "draw" : "settings",
  );
  // Winners on screen; a new one is shown only once the strip has stopped on it.
  const [shownWinners, setShownWinners] = useState(initial?.winners ?? []);
  const rollerRef = useRef<EntrantRollerHandle>(null);

  const run = async (
    body: Record<string, unknown>,
    after?: (r: Awaited<ReturnType<typeof call>>) => void,
    { reveal = true } = {},
  ) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await call(body);
      setFile(result.file);
      if (reveal) setShownWinners(result.file.winners);
      after?.(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const read = file ? readComments(file) : [];
  const byId = new Map(read.map((r) => [r.comment.id, r]));
  const entrants = read.filter((r) => r.counts);
  const pool = file ? drawPool(file, read) : [];
  const held = read.filter((r) => !r.counts);
  const pageComments = file ? file.comments.filter((c) => c.fromPage).length : 0;
  const named = read.filter((r) => r.comment.facebookName).length;

  const groups = HELD_GROUPS.map((g) => ({
    ...g,
    rows: held.filter((r) => HELD_GROUPS.find((x) => r.reasons.includes(x.reason))?.reason === g.reason),
  }));
  const skippedByHand = held.filter((r) => r.reasons.length === 0);

  const review = (r: ReadComment) => (value: "count" | "skip" | null, edit?: EntrantEdit | null) =>
    run({ action: "review", id, commentId: r.comment.id, review: value, ...(edit !== undefined ? { edit } : {}) });

  const draw = async () => {
    if (!file || pool.length === 0 || !award.trim()) return;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    setSpinning(true);
    // The Winner is saved first, so closing the page mid-spin never loses it.
    const result = await run(
      { action: "win", id, commentId: winner.commentId, award: award.trim() },
      undefined,
      { reveal: false },
    );
    if (result) {
      await rollerRef.current?.spin(winner, pool);
      setShownWinners(result.file.winners);
    }
    setSpinning(false);
  };

  const copyWinners = async () => {
    await navigator.clipboard.writeText(winnersText(shownWinners));
    setNotice("คัดลอกรายชื่อผู้ได้รางวัลแล้ว");
  };

  const awards = [...new Set(shownWinners.map((w) => w.award))];
  const latest = shownWinners.at(-1);

  const panelClass = (name: Panel) =>
    `collapse collapse-arrow rounded-box border border-base-300 bg-base-100 ${panel === name ? "collapse-open" : "collapse-close"}`;

  const panelTitle = (name: Panel, label: string) => (
    <button
      type="button"
      className="collapse-title text-left text-lg font-semibold"
      aria-expanded={panel === name}
      onClick={() => setPanel(name)}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 p-4">
      {error && <div className="alert alert-error text-sm">{error}</div>}
      {notice && <div className="alert alert-success text-sm">{notice}</div>}

      {/* Draw settings */}
      <div className={panelClass("settings")}>
        {panelTitle("settings", "⚙️ Setting")}
        <div className="collapse-content space-y-5">
          <p className="text-sm text-base-content/70">
            <span className="badge badge-warning badge-sm mr-2">DEV ONLY</span>
            เก็บไว้ที่ <code>dev-data/comment-draw/</code> และใช้ได้เฉพาะตอนรัน <code>npm run dev</code>
          </p>

          <section className="space-y-3">
            <h2 className="font-semibold">ดึงคอมเมนต์</h2>
            <form
              className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                void run({ action: "fetch", post, title }, (r) => {
                  setNotice(`ดึงแล้ว ${r.file.comments.length} คอมเมนต์`);
                  if (r.id !== id) router.push(`/random-scroll/facebook?draw=${r.id}`);
                });
              }}
            >
              <input
                className="input input-bordered input-sm"
                placeholder="ลิงก์โพสต์ หรือ <page id>_<post id>"
                value={post}
                onChange={(e) => setPost(e.target.value)}
                required
              />
              <input
                className="input input-bordered input-sm"
                placeholder="ชื่อกิจกรรม (ไม่ใส่ก็ได้)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" disabled={busy}>
                {busy ? "กำลังทำงาน..." : "ดึง / อัปเดตคอมเมนต์"}
              </button>
            </form>
            {draws.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draws.map((d) => (
                  <Link
                    key={d.id}
                    href={`/random-scroll/facebook?draw=${d.id}`}
                    className={`btn btn-sm ${d.id === id ? "btn-secondary" : "btn-outline"}`}
                  >
                    {d.title} ({d.comments})
                  </Link>
                ))}
              </div>
            )}
          </section>

          {file && (
            <>
              <div className="stats stats-vertical w-full border border-base-300 sm:stats-horizontal">
                <div className="stat">
                  <div className="stat-title">คอมเมนต์</div>
                  <div className="stat-value text-2xl">{read.length}</div>
                  <div className="stat-desc">ไม่นับของเพจอีก {pageComments}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">มีชื่อ Facebook</div>
                  <div className="stat-value text-2xl">
                    {named} / {read.length}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">ผู้มีสิทธิ์</div>
                  <div className="stat-value text-2xl text-success">{entrants.length}</div>
                  <div className="stat-desc">รอตรวจ / ไม่นับ {held.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">เหลือในกอง</div>
                  <div className="stat-value text-2xl">{pool.length}</div>
                  <div className="stat-desc">ได้รางวัลแล้ว {file.winners.length}</div>
                </div>
              </div>

              <section className="space-y-2">
                <h2 className="font-semibold">วางข้อความคอมเมนต์จาก Facebook (เพื่อใส่ชื่อ)</h2>
                <p className="text-xs text-base-content/70">
                  เปิดโพสต์ กด &quot;ดูความคิดเห็นเพิ่มเติม&quot; จนครบ ลากคลุมคอมเมนต์ทั้งหมดแล้ว Ctrl+C มาวางที่นี่
                </p>
                <textarea
                  className="textarea textarea-bordered h-32 w-full text-xs"
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  placeholder={"ชื่อคนคอมเมนต์\n ·\nข้อความคอมเมนต์\nตอบกลับ"}
                />
                <button
                  className="btn btn-sm"
                  disabled={busy || !paste.trim()}
                  onClick={() =>
                    run({ action: "paste", id, text: paste }, (r) => {
                      setNotice(`จับคู่ชื่อได้ ${r.matched} คอมเมนต์ จากที่วาง ${r.pasted} คอมเมนต์`);
                      setPaste("");
                    })
                  }
                >
                  จับคู่ชื่อ Facebook
                </button>
              </section>

              <section className="space-y-3">
                <h2 className="font-semibold">รอตรวจ ({held.length})</h2>
                {held.length === 0 && <p className="text-sm text-base-content/60">ไม่มีคอมเมนต์รอตรวจ</p>}
                {groups
                  .filter((g) => g.rows.length > 0)
                  .map((g) => {
                    const people = new Set(g.rows.map((r) => r.firstId)).size;
                    return (
                      <details key={g.reason} open className="rounded-box bg-base-200 p-2">
                        <summary className="cursor-pointer font-medium">
                          {g.title} — {g.rows.length} คอมเมนต์
                          {(g.reason === "duplicate-name" || g.reason === "duplicate-code") && ` (${people} คน)`}
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {g.rows.map((r) => (
                            <CommentRow
                              key={r.comment.id}
                              read={r}
                              first={r.firstId ? byId.get(r.firstId) : undefined}
                              busy={busy}
                              onReview={review(r)}
                            />
                          ))}
                        </ul>
                      </details>
                    );
                  })}
                {skippedByHand.length > 0 && (
                  <details className="rounded-box bg-base-200 p-2">
                    <summary className="cursor-pointer font-medium">
                      กดไม่นับเอง — {skippedByHand.length} คอมเมนต์
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {skippedByHand.map((r) => (
                        <CommentRow key={r.comment.id} read={r} busy={busy} onReview={review(r)} />
                      ))}
                    </ul>
                  </details>
                )}
                <details className="rounded-box bg-base-200 p-2">
                  <summary className="cursor-pointer font-medium">ผู้มีสิทธิ์ทั้งหมด — {entrants.length} คน</summary>
                  <ul className="mt-2 space-y-2">
                    {entrants.map((r) => (
                      <CommentRow key={r.comment.id} read={r} busy={busy} onReview={review(r)} />
                    ))}
                  </ul>
                </details>
              </section>

              <section className="flex flex-wrap items-center gap-2">
                <h2 className="grow font-semibold">ผู้ได้รางวัล ({file.winners.length})</h2>
                <button className="btn btn-sm" disabled={file.winners.length === 0} onClick={copyWinners}>
                  คัดลอกรายชื่อ
                </button>
                <button
                  className="btn btn-sm btn-outline btn-error"
                  disabled={busy || spinning || file.winners.length === 0}
                  onClick={() => {
                    if (confirm("ล้างรายชื่อผู้ได้รางวัลทั้งหมด และให้ทุกคนกลับเข้ากองสุ่ม?")) {
                      void run({ action: "reset-winners", id });
                    }
                  }}
                >
                  รีเซ็ตผู้ได้รางวัล
                </button>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Draw screen */}
      {file && (
        <div className={panelClass("draw")}>
          {panelTitle("draw", "🎰 Scroll")}
          <div className="collapse-content space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary">{file.title}</h1>
              <p className="mt-1 text-3xl font-bold text-base-content">
                {award.trim() ? `🎁 ${award.trim()}` : "🎁 ยังไม่ได้ใส่ชื่อรางวัล"}
              </p>
            </div>
            <EntrantRoller ref={rollerRef} idle={pool.length > 0 ? pool : entrants.map((r) => toEntrant(r))} />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                className="input input-bordered input-sm w-64"
                placeholder="ชื่อรางวัล เช่น Costume Wings ×1"
                aria-label="ชื่อรางวัล"
                value={award}
                disabled={spinning}
                onChange={(e) => setAward(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={busy || spinning || !award.trim() || pool.length === 0}
                onClick={draw}
              >
                {spinning ? "กำลังสุ่ม..." : "สุ่ม"}
              </button>
            </div>
            {pool.length === 0 && <p className="text-center text-sm text-error">ไม่เหลือผู้มีสิทธิ์ในกองแล้ว</p>}
            {latest && !spinning && (
              <div className="rounded-box border border-success bg-success/10 p-4 text-center">
                <p className="text-sm text-base-content/70">ผู้โชคดีล่าสุด · {latest.award}</p>
                <p className="text-3xl font-bold text-base-content">{latest.facebookName}</p>
                <p>
                  {latest.characterName || "-"} ({latest.cCode}) {latest.server}
                </p>
              </div>
            )}
            {awards.map((a) => (
              <div key={a}>
                <h3 className="mb-2 font-semibold">🎁 {a}</h3>
                <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {shownWinners
                    .filter((w) => w.award === a)
                    .map((w, i) => (
                      <li key={w.commentId} className="flex h-24 items-stretch gap-2">
                        <span className="self-center text-sm font-bold text-base-content/60">{i + 1}.</span>
                        <EntrantCard entrant={w} />
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
