"use client";

import { useState } from "react";
import { MESSAGE_MAX, MESSAGE_MIN, NAME_MAX } from "@/utils/feedbackLimits";

type Status = "idle" | "sending" | "sent";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: people never see or fill this
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const tooShort = message.trim().length < MESSAGE_MIN;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (tooShort || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, anonymous, message, website }),
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

  function again() {
    setName("");
    setAnonymous(false);
    setMessage("");
    setStatus("idle");
  }

  return (
    <main className="max-w-xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-primary mb-1">มีอะไรอยากบอกเรา?</h1>
      <p className="text-base-content/70 mb-6">
        ติชม เสนอแนะ แจ้งข้อผิดพลาด หรือขอให้เพิ่มเครื่องมือ เขียนไว้ได้เลย
      </p>

      {status === "sent" ? (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body items-center text-center">
            <p className="text-lg font-semibold">ขอบคุณที่บอกเรา 💌</p>
            <p className="text-base-content/70">ข้อความของคุณถูกส่งถึงผู้พัฒนาแล้ว</p>
            <button type="button" className="btn btn-primary btn-sm mt-2" onClick={again}>
              ส่งข้อความอีกอัน
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card bg-base-200 border border-base-300">
          <div className="card-body gap-4">
            <label className="form-control w-full">
              <span className="label-text mb-1 block">ชื่อ (ไม่บังคับ)</span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={anonymous ? "" : name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                disabled={anonymous}
                placeholder={anonymous ? "Anonymous" : "ชื่อของคุณ"}
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <span className="text-sm">ส่งแบบไม่ระบุชื่อ (Anonymous)</span>
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 block">ข้อความ</span>
              <textarea
                className="textarea textarea-bordered w-full min-h-40"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MESSAGE_MAX}
                required
                placeholder="เขียนข้อความที่นี่..."
              />
              <span className="text-xs text-base-content/60 mt-1 block text-right">
                {message.length}/{MESSAGE_MAX}
              </span>
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
              <p role="alert" className="text-error text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={tooShort || status === "sending"}
            >
              {status === "sending" ? "กำลังส่ง..." : "ส่งข้อความ"}
            </button>
            {tooShort && message.length > 0 && (
              <p className="text-xs text-base-content/60">ต้องมีอย่างน้อย {MESSAGE_MIN} ตัวอักษร</p>
            )}
          </div>
        </form>
      )}
    </main>
  );
}
