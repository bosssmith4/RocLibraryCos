import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SpritePlayer from "@/components/SpritePlayer/SpritePlayer";
import { SLOT_SPRITE } from "@/data/anniversary5thGuarantee";

/** The way into the Guarantee page: one slot machine, a card that is one big link. The slots and servers are chosen inside. */
export default function GuaranteeSlots() {
  return (
    <Link
      href="/5thAnvs/guarantee"
      className="group flex flex-wrap items-center gap-5 rounded-3xl border-2 border-(--anv-orange) bg-base-100 p-5 shadow-lg transition-shadow hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--anv-orange) sm:p-6"
    >
      <SpritePlayer
        src={SLOT_SPRITE}
        size={140}
        label="ตู้การันตี"
        className="shrink-0 rounded-2xl bg-base-200"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="text-3xl font-black">ตู้การันตี</h3>
        <p className="font-semibold">
          เปิด 5th Anniversary Scroll สะสม Coin แลก Key รับไอเท็มหายากแน่นอน · ดูไอเท็มแยกตามเซิร์ฟเวอร์และตู้ V.1–V.5
        </p>
        <span className="inline-flex items-center gap-2 rounded-full bg-(--anv-orange) px-6 py-2.5 text-lg font-black text-(--anv-ink) transition-transform group-hover:translate-x-1">
          เข้าไปดูตู้การันตี
          <ArrowRight aria-hidden className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
