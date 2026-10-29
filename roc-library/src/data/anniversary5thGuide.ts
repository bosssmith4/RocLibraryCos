import type { StoryGuide } from "@/types/anniversary";

/** What cuts across the Story Quest's Chapters, copied from the official Story Quest page. */
export const STORY_GUIDE: StoryGuide = {
  period: "28 ต.ค. 2026 – 13 ม.ค. 2027 (05:59)",
  notes: [
    "แทบทุก Chapter ต้องอยู่ในร่าง Marin ถ้ายังไม่มี รับร่างได้จาก NPC ของเควส",
    "วัตถุดิบของ Chapter II และ V ได้จากมอนสเตอร์ [Event] เองเมื่อรับเควสไว้ และได้เฉพาะตอนรับเควสอยู่",
    "ตอนส่งเควสวัตถุดิบ ระบบลบวัตถุดิบชนิดนั้นที่ถืออยู่ทั้งหมด ไม่ใช่แค่จำนวนที่ใช้",
    "ทุก Chapter ให้ World Fruit x100 ยกเว้น Extended / Awakened ที่ผ่านเควสซ้ำ จะได้แค่ World Fruit",
    "Chapter I ต้นทางเขียนทั้ง \"ทำได้ 1 ครั้งต่อตัวละคร\" และ \"ไม่จำกัดตามตัวละคร\" ขัดกัน ควรตรวจในเกม",
  ],
  hiNovice: [
    { job: "Hi Swordman", place: "Izlude (52 168)" },
    { job: "Hi Thief", place: "Thief Guild (moc_prydb1 44 125)" },
    { job: "Hi Acolyte", place: "Prontera (234 314)" },
    { job: "Hi Archer", place: "Archer Village (pay_archer 141 161)" },
    { job: "Hi Mage", place: "Geffen (67 176)" },
    { job: "Hi Merchant", place: "Alberta (37 41)" },
  ],
  hiClass: [
    "เมื่อ Job LV 40 ขึ้นไป ไปที่ Juno (yuno 90 318)",
    "เข้าแมพแล้วคุยกับ Book of Ymir",
    "คุยกับ NPC ของอาชีพตัวเอง เพื่อเป็น Hi Class Job 2",
  ],
  equipment: [
    {
      name: "Time Keeper Robe",
      from: "Time Guardian Box2 (Chapter III)",
      detail:
        "Enchant ธาตุที่ NPC Enchant Property Manage · prt_q 145 295 ผลสุ่ม · ครั้งแรก 500,000 Zeny รีเซ็ตธาตุครั้งละ 1,000,000 Zeny",
    },
    {
      name: "Noblesse Refine Ticket",
      from: "Noblesse Set (Chapter IV)",
      detail:
        "NPC Explorer Uncle · prt_q 145 285 · มี 3 ใบ ใบละ 10,000,000 Zeny ใช้อัปเกรดได้เฉพาะ Noblesse Set 3 ชิ้นตามหน้าทางการ",
    },
    {
      name: "5th ROC Anniversary Ring [1]",
      from: "Chapter V",
      detail: "ซื้อ 10,000,000 Zeny ได้ 1 ครั้งต่อตัวละคร",
    },
  ],
};

/** One [NFS] Gacha Ticket is worth this many World Fruit. */
export const WORLD_FRUIT_PER_TICKET = 1_200;

/** Where World Fruit comes from; one World Fruit counts toward the Gacha Ticket price. */
export const WORLD_FRUIT_SOURCES: {
  source: string;
  amount: number;
  unit: string;
  detail: string;
  /** where on the 5th Anniversary page to learn how */
  href: string;
}[] = [
  {
    source: "Main Quest · มี Marin Transform Item",
    amount: 600,
    unit: "ชิ้น",
    detail: "ครบ 6 Chapter · Chapter ละ 100",
    href: "/5thAnvs#map-title",
  },
  {
    source: "Main Quest · ไม่มี Marin Transform Item",
    amount: 500,
    unit: "ชิ้น",
    detail: "ได้ 5 Chapter · Chapter VI ต้องมี Marin Transform Item",
    href: "/5thAnvs#map-title",
  },
  {
    source: "Daily Quest",
    amount: 20,
    unit: "ชิ้น/วัน",
    detail: "ได้เควสแบบสุ่ม ทำได้วันละครั้ง · เควสละ 20 ชิ้น",
    href: "/5thAnvs#recurring-title",
  },
  {
    source: "Weekly Quest",
    amount: 60,
    unit: "ชิ้น/สัปดาห์",
    detail: "ทำได้ 3 เควส · เควสละ 20 ชิ้น รวม 60",
    href: "/5thAnvs#recurring-title",
  },
  {
    source: "Dragon Cataclysm",
    amount: 100,
    unit: "ชิ้น",
    detail: "ได้ Black Soul ×100 และ 1 Black Soul = 1 World Fruit · ทำได้ ศ · ส · อา",
    href: "/5thAnvs#recurring-title",
  },
  {
    source: "World Event · เซิร์ฟเวอร์ครบ 5,555 เควส",
    amount: 20,
    unit: "ชิ้น/วัน",
    detail: "ทุกคนในเซิร์ฟเวอร์ได้วันละ 20 ชิ้น",
    href: "/5thAnvs#recurring-title",
  },
];


/**
 * How to reach one Gacha Ticket's worth of World Fruit, for the plan on the main page. Every figure
 * is copied from the quests above it; the weekly counts are the part to check against the game.
 */
export const WORLD_FRUIT_PLAN = {
  /** World Fruit each finished Chapter gives */
  perChapter: 100,
  /** Chapters finished: all six with a Marin Transform Item, five without (Chapter VI needs it) */
  chapters: { withMarin: 6, withoutMarin: 5 },
  /** Sources that come back, per week */
  repeating: [
    {
      id: "daily",
      name: "Daily Quest",
      claimsPerWeek: 7,
      perClaim: 20,
      how: "เควสสุ่มวันละ 1 อัน × 20 ชิ้น × ทุกวัน",
      itemImageId: 6435,
      requiresChapter: 3,
    },
    {
      id: "weekly",
      name: "Weekly Quest",
      claimsPerWeek: 3,
      perClaim: 20,
      how: "3 เควส × 20 ชิ้น × สัปดาห์ละครั้ง",
      itemImageId: 6435,
      requiresChapter: 4,
    },
    {
      id: "dragon",
      name: "Dragon Cataclysm",
      claimsPerWeek: 1,
      perClaim: 100,
      how: "ได้ Black Soul ×100 · ทำได้ ศ ส อา และพัก 4 วัน จึงได้สูงสุดสัปดาห์ละครั้ง",
      itemImageId: 6914,
      tradable: true,
      exchange: { label: "World Fruit", rate: "1 : 1", itemImageId: 6435 },
      requiresChapter: 5,
    },
    {
      id: "event",
      name: "World Event",
      claimsPerWeek: 7,
      perClaim: 20,
      how: "20 ชิ้น × ทุกวัน · เมื่อเซิร์ฟเวอร์ครบ 5,555 เควส",
      itemImageId: 6435,
      conditional: true,
    },
  ] as {
    id: string;
    name: string;
    claimsPerWeek: number;
    perClaim: number;
    how: string;
    requiresChapter?: number;
    /** the item it pays in: its picture is items/<itemImageId>.bmp */
    itemImageId: string | number;
    /** the payment can be traded between players */
    tradable?: boolean;
    /** what the payment can be turned into */
    exchange?: { label: string; rate: string; itemImageId?: string | number };
    /** only counts when something outside the player's hands happens */
    conditional?: boolean;
  }[],
  /** what the numbers assume, shown to the player so they can check them */
  assumptions: [
    "Daily ได้เควสแบบสุ่มวันละ 1 อัน เควสละ 20 ชิ้น จึงได้วันละ 20 ชิ้น",
    "Weekly ทำได้ครบ 3 เควส เควสละ 20 ชิ้น รวม 60 ชิ้นต่อสัปดาห์",
    "Dragon Cataclysm ให้ Black Soul ×100 ซึ่ง 1 Black Soul = 1 World Fruit ทำได้ 1 เควสต่อ 4 วัน และเฉพาะ ศ · ส · อา จึงนับเป็นสัปดาห์ละ 1 ครั้ง",
    "World Event ได้ 20 ชิ้นต่อวัน เมื่อเซิร์ฟเวอร์ครบ 5,555 เควส ผู้เล่นคุมไม่ได้ จึงแยกไว้ ไม่รวมในยอดหลัก",
    "จำนวนวันเป็นค่าประมาณ ปัดขึ้น และเริ่มนับเมื่อปลดล็อกครบทุกเควสแล้ว",
  ],
};
