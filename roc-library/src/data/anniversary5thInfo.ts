import type { AnniversaryInfoSection } from "@/types/anniversary";

/**
 * Event info sections of the 5th Anniversary page, shown above the Rewards.
 * Chapter texts were copied by eye from the official Chapter board, so check
 * the spelling against the game. An entry with no `detail` shows a
 * "collecting data" note.
 */
export const ANNIVERSARY_INFO_SECTIONS: AnniversaryInfoSection[] = [
  {
    id: "chapters",
    title: "Chapter 6 เมือง",
    summary: "เนื้อเรื่องของกิจกรรมครบรอบ 5 ปี แบ่งเป็น 6 Chapter ตามเมือง",
    layout: "route",
    entries: [
      {
        title: "Izlude",
        numeral: "I",
        subtitle: "Reincarnation",
        heading: "การจุติใหม่",
        detail: ["ตื่นขึ้นโดยไร้ความทรงจำ พลังลึกลับยังหลับไหล ปลุกตื่นได้จากการเดินทาง"],
        tagline: "มุ่งไปอย่างก้าวกระโดด",
        logo: { src: "/assets/images/anvs/chapters/logo-izlude.svg", alt: "Chapter I Izlude" },
      },
      {
        title: "Payon",
        numeral: "II",
        subtitle: "Foundation",
        heading: "รากฐานแห่งอณาจักร",
        detail: ["พลังหาใช่ความแกร่งที่แท้ ความเข้าใจคือบ่อเกิด ปกป้องและหวงแหน"],
        tagline: "จะนำพาสู่พลังที่แท้จริง",
        logo: { src: "/assets/images/anvs/chapters/probation-set.svg", alt: "Probation Set" },
        art: { src: "/assets/images/anvs/chapters/probation-set.svg", alt: "Probation Set" },
      },
      {
        title: "Alberta",
        numeral: "III",
        subtitle: "Free Trade",
        heading: "เปิดเส้นทางการค้า",
        detail: ["การค้าถูกตัดขาด เชื่อมเส้นทางกลับเข้าหา มุ่งคุ้มกันและฟื้นฟู"],
        tagline: "ความมั่งคั่งจึงหวนคืน",
        logo: { src: "/assets/images/anvs/chapters/noblesse-set.svg", alt: "Noblesse Set" },
        art: { src: "/assets/images/anvs/chapters/noblesse-set.svg", alt: "Noblesse Set" },
      },
      {
        title: "Geffen",
        numeral: "IV",
        subtitle: "Trial of Strength",
        heading: "บททดสอบแห่งพลัง",
        detail: ["ควบคุมพลังด้วยปัญญา เมื่อมันถูกจำกัด ทุกการตัดสินใจจึงสำคัญ"],
        tagline: "เมืองแห่งการทดสอบ",
        logo: { src: "/assets/images/anvs/chapters/ring-5th.svg", alt: "5th Anniversary Ring [1]" },
        art: { src: "/assets/images/anvs/chapters/ring-5th.svg", alt: "5th Anniversary Ring [1]" },
      },
      {
        title: "Morroc",
        numeral: "V",
        subtitle: "Break Your Limits",
        heading: "ทลายขีดจำกัด",
        detail: ["วิกฤตเกิดทุกทิศทาง ได้เวลา สิ่งที่หลับไหลตื่น ขีดจำกัดถูกปลดออก"],
        tagline: "ปลุกพลัง ขั้นสมบูรณ์ !",
        logo: { src: "/assets/images/anvs/chapters/logo-morroc.svg", alt: "Chapter V Morroc" },
      },
      {
        title: "Prontera",
        numeral: "VI",
        subtitle: "The End of Beginning",
        heading: "จุดสิ้นสุดของจุดเริ่มต้น",
        detail: ["ถูกต้อนรับในฐานะผู้กล้า ช่วงเวลาแห่งการเฉลิมฉลอง หากแต่ มิใช่ตอนจบแท้จริง"],
        tagline: "ภัยครั้งใหม่กำลังก่อตัว",
        logo: { src: "/assets/images/anvs/chapters/logo-prontera.svg", alt: "Chapter VI Prontera" },
      },
    ],
  },
  {
    id: "quest-types",
    title: "Daily / Weekly / World Quest",
    layout: "tiles",
    entries: [
      { title: "Daily Quest" },
      { title: "Weekly Quest" },
      { title: "World Quest" },
    ],
  },
];
