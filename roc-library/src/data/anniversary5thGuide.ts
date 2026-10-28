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
