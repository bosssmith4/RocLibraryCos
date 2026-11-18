import { loadLatestMonsterX3Event } from "@/data/monsterx3";
import { loadScrolls } from "@/data/scroll";
import type { HomeSlide } from "@/types/homeSlide";
import type { ScrollDef } from "@/types/scroll";

/** Dates in Thai style (Buddhist year), in Thailand time, as the game's announcements write them. */
const thaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** How many pictures the reel on a Scroll slide shows. */
const REEL_SIZE = 5;

function scrollSlide(
  scroll: ScrollDef,
  tone: "festa" | "libra",
  kicker: string,
): HomeSlide {
  // Rarest Prizes first; two Prizes that share one picture count once.
  const rarest = [...scroll.prizes].sort((a, b) => a.rate - b.rate);
  const seen = new Set<string>();
  const prizes = rarest
    .filter((p) => !seen.has(p.image) && seen.add(p.image))
    .slice(0, REEL_SIZE)
    .map((p) => ({ src: p.image, tier: p.tier, name: p.name }));

  return {
    id: scroll.id,
    href: `/random-scroll?scroll=${scroll.id}`,
    tone,
    kicker,
    title: scroll.title,
    description: "จำลองการสุ่มและลุ้นรางวัลหายาก ได้ไม่จำกัดครั้ง",
    meta: `${scroll.prizes.length} รางวัล · หายากสุด ${rarest[0].rate}%`,
    cta: "ลองสุ่มเลย",
    art: { kind: "reel", prizes },
  };
}

/**
 * The banners of the home page, in the order they are shown. Event slides are built from the
 * same files as their pages, so a new round of Monster x3 or a new Scroll needs no change here.
 */
export async function buildHomeSlides(): Promise<HomeSlide[]> {
  const [event, scrolls] = await Promise.all([
    loadLatestMonsterX3Event(),
    loadScrolls(),
  ]);

  const strongest = [...event.monsters].sort((a, b) => b.exp - a.exp).slice(0, 3);
  const areas = new Set(event.monsters.map((m) => m.group)).size;

  const slides: HomeSlide[] = [
    {
      id: "monsterx3",
      href: "/monsterx3",
      tone: "desert",
      kicker: "TRIPLE EXP",
      title: event.title,
      description: `EXP และ JOB x${event.multiplier} ใน ${areas} พื้นที่ ดูว่าไปล่าที่ไหนคุ้มสุด`,
      meta: `${thaiDate(event.from)} – ${thaiDate(event.to)} · ${event.monsters.length} มอนสเตอร์`,
      cta: "ดูรายชื่อมอนสเตอร์",
      glyph: `×${event.multiplier}`,
      art: {
        kind: "monsters",
        images: strongest.map((m) => ({
          src: `/assets/images/monsterDb/${m.id}.gif`,
          alt: m.name ?? `Monster ${m.id}`,
        })),
      },
    },
    {
      id: "anniversary5th",
      href: "/5thAnvs",
      tone: "anniversary",
      kicker: "5TH ANNIVERSARY",
      title: "ครบรอบ 5 ปี ROC",
      description: "Chapter 6 เมือง เควสรายวัน และของรางวัลฉลองครบรอบ",
      cta: "เปิดดูกิจกรรม",
      glyph: "5",
      art: { kind: "party" },
    },
  ];

  const libra = scrolls.find((s) => s.id === "libra2026");
  const festa = scrolls.find((s) => s.id === "festa2026");
  const capricorn = scrolls.find((s) => s.id === "capricorn2026");
  const taurus = scrolls.find((s) => s.id === "taurus2026");
  if (libra) slides.push(scrollSlide(libra, "libra", "SCROLL SIMULATOR"));
  if (festa) slides.push(scrollSlide(festa, "festa", "SCROLL SIMULATOR"));
  if (capricorn) slides.push(scrollSlide(capricorn, "festa", "SCROLL SIMULATOR"));
  if (taurus) slides.push(scrollSlide(taurus, "libra", "SCROLL SIMULATOR"));

  return slides;
}
