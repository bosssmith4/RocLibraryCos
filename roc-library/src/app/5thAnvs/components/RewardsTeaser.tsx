import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ART = "/assets/images/anvs/landing";

/** Props floating around the card: [file, position/size classes, seconds of delay]. */
const PROPS: [string, string, string][] = [
  ["gift.svg", "right-4 top-4 w-16 sm:right-10 sm:w-24", "0s"],
  ["ticket.svg", "right-[28%] bottom-3 hidden w-20 sm:block", "-1.5s"],
  ["coin.svg", "right-4 bottom-4 w-12 sm:right-12 sm:w-16", "-0.8s"],
];

/** The way into the Rewards page, a poster card that is one big link. */
export default function RewardsTeaser() {
  return (
    <Link
      href="/5thAnvs/rewards"
      className="anvs-hero group relative block overflow-hidden rounded-3xl px-6 py-8 shadow-lg transition-shadow hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--anv-orange) sm:px-10 sm:py-10"
    >
      {PROPS.map(([file, className, delay]) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={file}
          src={`${ART}/${file}`}
          alt=""
          aria-hidden
          className={`anvs-bob pointer-events-none absolute h-auto drop-shadow-lg ${className}`}
          style={{ animationDelay: delay }}
        />
      ))}
      <div className="relative max-w-md space-y-3">
        <h3 className="text-3xl font-black sm:text-4xl">ของรางวัลฉลองครบรอบ</h3>
        <p className="font-semibold">
          แลกด้วย [NFS] Gacha Ticket 1 ใบ + 1,000,000 Zeny ต่อครั้ง · Baphomet
          และ Moonlight
        </p>
        <span className="inline-flex items-center gap-2 rounded-full bg-(--anv-hero-fg) px-6 py-2.5 text-lg font-black text-(--anv-hero-solid) transition-transform group-hover:translate-x-1">
          ดูของรางวัล
          <ArrowRight aria-hidden className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
