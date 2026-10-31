import { ArrowDown, ArrowRight, CalendarClock, Coins, KeyRound, MapPin, ScrollText, Sparkles } from "lucide-react";
import { GUARANTEE, GUARANTEE_SOURCE } from "@/data/anniversary5thGuarantee";
import { CoordinateText } from "./CoordinateLink";
import { KEY_TONE } from "./keyTone";
import SourceRef from "./SourceRef";

const fmt = (n: number) => n.toLocaleString("en-US");
const MOST = Math.max(...GUARANTEE.keys.map((k) => k.coins));

/** The four steps, in the order a player does them. */
const STEPS = [
  { icon: ScrollText, title: "เปิด Scroll", text: "5th Anniversary Scroll 1 ครั้ง" },
  { icon: Coins, title: "ได้ Coin", text: `${GUARANTEE.coin} 1 ชิ้นทุกครั้ง` },
  { icon: KeyRound, title: "แลก Key", text: "สะสม Coin ให้ครบ แล้วแลก Key" },
  { icon: Sparkles, title: "รับไอเท็ม", text: `ใช้ Key แลกไอเท็ม 1 ชิ้นที่ NPC ${GUARANTEE.npc}` },
];

/**
 * How the Guarantee machine works, read top to bottom: the four steps, then the two keys side by side
 * (each in its own colour, with what it costs and what it gives), then where and until when.
 */
export default function GuaranteeMachine() {
  return (
    <div className="space-y-6 rounded-3xl border-2 border-(--anv-orange) bg-base-100 p-5 shadow-lg sm:p-6">
      <div className="leading-tight">
        <h3 className="text-2xl font-black">ตู้การันตีทำงานอย่างไร</h3>
        <p className="text-sm text-base-content/70">เปิด Scroll เก็บ Coin แลก Key แล้วเลือกไอเท็มหายากที่ต้องการ</p>
      </div>

      <ol className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row">
            <div className="flex w-full flex-1 items-center gap-3 rounded-2xl bg-base-200 p-3 lg:h-full">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--anv-orange) text-(--anv-ink)">
                <s.icon aria-hidden className="h-6 w-6" />
                <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-(--anv-ink) text-xs font-black text-(--anv-cream)">
                  {i + 1}
                </span>
              </span>
              <p className="min-w-0 leading-tight">
                <span className="block font-black">{s.title}</span>
                <span className="block text-sm text-base-content/70">{s.text}</span>
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <>
                <ArrowDown aria-hidden className="h-5 w-5 shrink-0 text-(--anv-orange) lg:hidden" strokeWidth={3} />
                <ArrowRight
                  aria-hidden
                  className="hidden h-5 w-5 shrink-0 text-(--anv-orange) lg:block"
                  strokeWidth={3}
                />
              </>
            )}
          </li>
        ))}
      </ol>

      <div className="space-y-2">
        <h4 className="border-b-2 border-(--anv-ink) pb-1 text-lg font-black">Key มี 2 แบบ เลือกตามจำนวน Coin</h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GUARANTEE.keys.map((k) => {
            const tone = KEY_TONE[k.id as "gold" | "silver"];
            return (
              <li key={k.id} className={`overflow-hidden rounded-2xl border-2 ${tone.border} ${tone.soft}`}>
                <div className={`flex items-center gap-3 px-4 py-3 ${tone.solid}`}>
                  <KeyRound aria-hidden className="h-8 w-8 shrink-0" />
                  <p className="min-w-0 flex-1 text-lg font-black leading-tight">{k.name}</p>
                  <span className="rounded-full bg-base-100 px-3 py-0.5 text-lg font-black text-base-content">
                    ระดับ {k.grade}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <p className="flex flex-wrap items-baseline gap-x-2 leading-tight">
                    <span className="text-xs font-bold text-base-content/70">ใช้</span>
                    <span className="text-3xl font-black">{fmt(k.coins)}</span>
                    <span className="text-sm font-bold">Coin</span>
                  </p>
                  <div className="h-2.5 overflow-hidden rounded-full bg-base-100" aria-hidden>
                    <div
                      className={`h-full rounded-full ${tone.solid.split(" ")[0]}`}
                      style={{ width: `${(k.coins / MOST) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold">แลกได้ {k.prize} 1 ชิ้น</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl bg-base-200 p-4">
        <p className="flex flex-wrap items-center gap-2 text-sm font-black">
          <MapPin aria-hidden className="h-4 w-4" />
          แลกที่ NPC {GUARANTEE.npc}
          <span className="rounded-full bg-base-100 px-3 py-1 font-bold">
            Invaded Prontera · <CoordinateText text={GUARANTEE.npcAt} />
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <CalendarClock aria-hidden className="h-4 w-4" />
          {GUARANTEE.period}
        </p>
        <ul className="space-y-1">
          {GUARANTEE.notes.slice(1).map((n) => (
            <li key={n} className="list-inside list-disc text-sm leading-snug">
              {n}
            </li>
          ))}
        </ul>
      </div>

      <SourceRef href={GUARANTEE_SOURCE} title="Guarantee Anniversary Gacha" />
    </div>
  );
}
