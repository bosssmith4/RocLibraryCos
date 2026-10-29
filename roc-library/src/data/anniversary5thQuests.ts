import type { ChapterQuest, QuestTask, RecurringQuestGroup } from "@/types/anniversary";

/**
 * Quests of the 5th Anniversary event, from the game's quest text. Obvious typos
 * of the source are fixed and the unclear line "ณ เมื่อการค้า Alberta" is left out.
 */
const WORLD_FRUIT: QuestTask = { kind: "reward", label: "World Fruit", count: 100, unit: "ชิ้น", itemImageId: 6435 };

const DAILY_WEEKLY_REWARDS: QuestTask[] = [
  { kind: "reward", label: "World Fruit", count: 20, itemImageId: 6435 },
  { kind: "reward", label: "Jam Pancake", count: 20, itemImageId: 592 },
];

export const CHAPTER_QUESTS: ChapterQuest[] = [
  {
    town: "Izlude",
    gameTitle: "Chapter I - Reincarnation : การจุติใหม่",
    kind: "สังหาร",
    requirements: ["LV 99 ขึ้นไป", "อยู่ในร่าง Marin (รับจาก NPC ได้ถ้ายังไม่มี)", "ทำได้ 1 ครั้งต่อตัวละคร (ต้นทางเขียนขัดกัน ควรตรวจในเกมอีกครั้ง)"],
    steps: [
      "คุยกับกะลาสีที่มุมขวาบนของ Izlude (191 210)",
      "ใช้วาร์ปไป Byalan แล้วเดินไปวาร์ป Undersea Tunnel 1F",
      "คุยกับ Valkyrie ใน Undersea Tunnel 1F (162 173) เพื่อรับเควส ต้องอยู่ในร่าง Marin",
    ],
    intro: "ท่าน Valkyrie ให้ไปสังหารมอนสเตอร์ต่อไปนี้ แล้วกลืนกินพลังมา",
    tasks: [
      { kind: "kill", label: "Plankton", count: 10, unit: "ตัว", monsterId: 1161 },
      { kind: "kill", label: "Hydra", count: 20, unit: "ตัว", monsterId: 1068 },
      { kind: "kill", label: "Marina", count: 30, unit: "ตัว", monsterId: 1141 },
    ],
    rewards: [
      { kind: "reward", label: "Job EXP LV 50" },
      WORLD_FRUIT,
      { kind: "reward", label: "ปลดล็อก Chapter II (Payon)", via: "หลังเสร็จ Valkyrie วาร์ปไป Chapter II ให้ได้" },
    ],
    outro: "หลังจากนั้นกลับมารายงานเมื่อภารกิจสำเร็จแล้ว",
  },
  {
    town: "Payon",
    gameTitle: "Chapter II - Foundation : จุดเริ่มต้นของประเทศ",
    kind: "รวบรวม",
    requirements: ["LV 99 ขึ้นไป", "อยู่ในร่าง Marin", "จบ Chapter I แล้ว", "ทำได้ 1 ครั้งต่อตัวละคร"],
    steps: [
      "คุยกับ NPC Guarder ใน Payon เพื่อรับเควสเก็บวัตถุดิบ 3 อย่าง",
      "ฆ่ามอนสเตอร์ [Event] ตามด้านล่าง วัตถุดิบเข้ากระเป๋าเองเมื่อรับเควสแล้ว",
      "Firewood: Savage ที่ Payon Forest (pay_fild09 / pay_fild08) ไปทางมุมขวาของ Payon",
      "Leaf Made Wood: Muka ที่ Payon Cave 1F / 2F (pay_dun00 / pay_dun01) ผ่านทางเหนือของ Payon > Archer Village > Payon Cave",
      "Clean Water: Marina ที่ Payon Cave 3F (pay_dun02) เส้นทางเดียวกับ Muka",
      "กลับไปส่งกับ Guarder ระบบลบวัตถุดิบชนิดนั้นที่ถืออยู่ทั้งหมด",
    ],
    tasks: [
      { kind: "collect", label: "Firewood", count: 30, unit: "ชิ้น", via: "จากการสังหาร Savage [Event]", monsterId: 1166, itemImageId: 25254 },
      { kind: "collect", label: "Leaf Made Wood", count: 30, unit: "ชิ้น", via: "จากการสังหาร Muka [Event]", monsterId: 1055, itemImageId: 6553 },
      { kind: "collect", label: "Clean Water", count: 30, unit: "ชิ้น", via: "จากการสังหาร Marina [Event]", monsterId: 1141, itemImageId: 6466 },
    ],
    rewards: [
      { kind: "reward", label: "เปลี่ยนเป็น Hi Novice LV 1 / Job 1 หรือ Hi Extend LV 99 / Job 1", via: "ดูตารางเปลี่ยนอาชีพด้านล่าง" },
      WORLD_FRUIT,
      { kind: "reward", label: "ปลดล็อก Chapter III (Alberta)" },
    ],
    notes: ["ตัวละคร Hi Class หรือ Extend ที่ผ่านเควสนี้ ได้แค่ World Fruit x100"],
    outro: "หลังจากนั้นกลับมารายงานเมื่อภารกิจสำเร็จแล้ว",
  },
  {
    town: "Alberta",
    gameTitle: "Chapter III - Free trade : การเปิดเส้นทางการค้า",
    kind: "ตอบคำถาม",
    intro: "เมื่อท่านต้องการการสนับสนุน ท่านก็ต้องผ่านบททดสอบ",
    requirements: ["Hi Class LV 1 + Job 50 ขึ้นไป หรือ Extend LV 99 + Job 50 ขึ้นไป", "อยู่ในร่าง Marin", "จบ Chapter II แล้ว", "ทำได้ 1 ครั้งต่อตัวละคร"],
    steps: ["คุยกับ NPC Black Market ใน Alberta แล้วเลือกบทสนทนาตอบคำถาม", "ตอบให้ถูกทั้ง 5 ข้อ ถ้าผิดต้องเริ่มใหม่และรอ 30 วินาที"],
    tasks: [{ kind: "quiz", label: "ตอบคำถามให้ถูกทั้งหมด", count: 5, unit: "ข้อ" }],
    quizAnswers: ["Prontera", "Glast Heim", "Super Novice", "Awakened", "Dracula"],
    rewards: [
      { kind: "reward", label: "Probation +7", via: "รับหลังจบ Chapter III จาก NPC Equipment Provider · prt_q 145 295" },
      { kind: "reward", label: "Grace Spirit Shadow Set" },
      { kind: "reward", label: "Time Guardian Box2", via: "ได้ Time Keeper Robe (ราคา enchant ดูด้านล่าง)" },
      WORLD_FRUIT,
      { kind: "reward", label: "ปลดล็อก Chapter IV (Geffen)" },
    ],
    notes: [
      "หากตอบผิดแม้แต่ข้อเดียว ต้องกลับมาตอบใหม่ภายหลัง",
      "เมื่อตอบผิด (กับ Black Market) ต้องรอ 30 วินาทีก่อนตอบใหม่",
    ],
  },
  {
    town: "Geffen",
    gameTitle: "Chapter IV - Trial of strength : การประลองสู่ความแข็งแกร่ง",
    kind: "สังหาร",
    intro: "ท่านได้เข้าร่วมทดสอบความแข็งแกร่ง",
    requirements: ["อยู่ในร่าง Marin", "จบ Chapter III แล้ว", "ทำได้ 1 ครั้งต่อตัวละคร", "เข้า Geffen Magic Tournament ต้อง LV 90 ขึ้นไป"],
    steps: [
      "คุยกับ NPC Stranger ใน Geffen เพื่อรับเควส",
      "รับเควส Geffen Magic แล้วคุยกับ Emmit White เพื่อเข้า Geffen Magic Tournament",
      "ฆ่าเป้าหมายในสนามประลอง (รายละเอียดการแข่งดูที่ roc.gnjoy.in.th/event/geffen-magic-tournament/)",
    ],
    tasks: [
      { kind: "kill", label: "Arhi", count: 1, unit: "ตัว", via: "ใน Geffen Magic Tournament", monsterId: 2549 },
      { kind: "kill", label: "Dio anemos", count: 1, unit: "ตัว", via: "ใน Geffen Magic Tournament", monsterId: 2550 },
    ],
    rewards: [
      { kind: "reward", label: "Noblesse Set", via: "นำไปที่ NPC Explorer Uncle · prt_q 145 285" },
      WORLD_FRUIT,
      { kind: "reward", label: "ปลดล็อก Chapter V (Morroc)" },
    ],
    outro: "เมื่อสำเร็จก็กลับมายืนยันกับ Stranger",
  },
  {
    town: "Morroc",
    gameTitle: "Chapter V - Break your limits : การทลายขีดจำกัด",
    kind: "รวบรวม",
    intro: "เพื่อให้ได้แหวนเวทย์มนต์",
    requirements: ["จบ Chapter IV แล้ว", "อยู่ในร่าง Marin", "Hi Class LV 99 Job 1 หรือ Extend LV 99 Job 1"],
    steps: [
      "คุยกับ NPC 5th Anniversary Exchange ใน Morroc รับได้พร้อมกันสูงสุด 2 เควส",
      "Shadow Stone: Desert Wolf [Event] ที่ Pyramid 3F / 4F (moc_pryd03 / moc_pryd04) ผ่านมุมซ้ายบนของ Morroc > Morroc Ruins > Pyramid",
      "Flame Stone: Jakk [Event] ที่ Sphinx B1F / B2F (in_sphinx1 / in_sphinx2) ผ่านกลางซ้ายของ Morroc > Sograt Desert > Sphinx",
      "กลับไปส่งกับ NPC เดิม",
    ],
    tasks: [
      { kind: "collect", label: "Shadow Stone", count: 45, unit: "ชิ้น", via: "จากการสังหาร Desert Wolf [Event]", monsterId: 1107, itemImageId: 105675 },
      { kind: "collect", label: "Flame Stone", count: 45, unit: "ชิ้น", via: "จากการสังหาร Jakk [Event]", monsterId: 1130, itemImageId: 105676 },
    ],
    rewards: [
      { kind: "reward", label: "สิทธิ์ซื้อ 5th ROC Anniversary Ring [1]", via: "ราคา 10,000,000 Zeny · ซื้อได้ 1 ครั้งต่อตัวละคร" },
      WORLD_FRUIT,
      { kind: "reward", label: "ปลดล็อก Chapter VI", via: "เฉพาะผู้ Pre-Register หรือมี Marin" },
    ],
  },
  {
    town: "Prontera",
    gameTitle: "Chapter VI - The end of the beginning : จุดสิ้นสุดของจุดเริ่มต้น",
    kind: "ตามหากล่อง",
    intro: "เพื่อก้าวข้ามขีดจำกัดที่แท้จริง",
    requirements: ["จบ Chapter V แล้ว", "อยู่ในร่าง Marin", "ต้องมี Marin Transform Item จึงรับเควสได้"],
    steps: ["คุยกับ NPC Fairy Queen ใน Prontera", "ตามหากล่อง Treasure 6 จุดในแมพ (พิกัดด้านล่าง)"],
    tasks: [{ kind: "find", label: "ตามหากล่องภายในแมพให้ครบ", count: 6, unit: "จุด" }],
    coordinates: [
      "prt_q 87 339",
      "prt_q 32 157",
      "prt_q 36 76",
      "prt_q 198 157",
      "prt_q 284 271",
      "prt_q 238 40",
    ],
    rewards: [
      { kind: "reward", label: "เลื่อนเป็น High Class LV 99 / Job 70 ทันที" },
      WORLD_FRUIT,
      { kind: "reward", label: "Awakened LV 1 / Job 1", via: "เมื่อทุกอาชีพถึง High Class LV 99 / Job 70 แล้ว คุยกับ Fairy Queen อีกครั้ง" },
    ],
    notes: [
      "น้ำหนักตัวละครต้องเป็น 0 ตอนเปลี่ยนเป็น Awakened",
      "ตัวละคร Extended หรือ Awakened ที่มี Marin Transform Item ได้แค่ World Fruit x100",
    ],
  },
];

export const RECURRING_QUESTS: RecurringQuestGroup[] = [
  {
    id: "daily",
    title: "Daily Quest",
    note: "เควสที่ได้เป็นแบบสุ่ม · เมื่อรายงานสำเร็จแล้ว ต้องรอ 1 วัน",
    requiresChapter: 3,
    rewards: DAILY_WEEKLY_REWARDS,
    rewardNote: "ส่งเควสสำเร็จ · ได้รับ 1 ครั้ง ต่อเควส",
    quests: [
      {
        title: "Daily 1",
        tasks: [{ kind: "collect", label: "Firewood", count: 25, unit: "ชิ้น", via: "จากการสังหาร Savage [Event]", monsterId: 1166, itemImageId:25254 }],
      },
      {
        title: "Daily 2",
        tasks: [{ kind: "collect", label: "Leaf Made Wood", count: 25, unit: "ชิ้น", via: "จากการสังหาร Muka [Event]", monsterId: 1055, itemImageId: 6553 }],
      },
      {
        title: "Daily 3",
        tasks: [{ kind: "collect", label: "Clean Water", count: 25, unit: "ชิ้น", via: "จากการสังหาร Marina [Event]", monsterId: 1141, itemImageId: 6466}],
      },
    ],
  },
  {
    id: "weekly",
    title: "Weekly Quest",
    note: "ทำได้ครบ 3 เควส · รวม World Fruit 60 ต่อสัปดาห์",
    requiresChapter: 4,
    rewards: DAILY_WEEKLY_REWARDS,
    rewardNote: "ส่งเควสสำเร็จ · ได้รับ 1 ครั้ง ต่อเควส",
    quests: [
      {
        title: "Weekly 1",
        tasks: [{ kind: "collect", label: "Shadow Stone", count: 40, unit: "ชิ้น", via: "จากการสังหาร Desert Wolf [Event]", monsterId: 1107, itemImageId: 105675}],
      },
      {
        title: "Weekly 2",
        tasks: [{ kind: "collect", label: "Flame Stone", count: 40, unit: "ชิ้น", via: "จากการสังหาร Jakk [Event]", monsterId: 1130, itemImageId: 105676 }],
      },
      {
        title: "Weekly 3",
        tasks: [
          { kind: "kill", label: "Arhi", via: "ใน Geffen Magic Tournament", monsterId: 2549 },
          { kind: "kill", label: "Dio anemos", via: "ใน Geffen Magic Tournament", monsterId: 2550 },
        ],
      },
    ],
  },
  {
    id: "world",
    title: "World Quest",
    note: "กิจกรรมทั้งเซิร์ฟเวอร์ · 28 ต.ค. 2026 – 13 ม.ค. 2027 · ต้องผ่าน Chapter V - Break your limits (Morroc) ก่อนรับภารกิจ",
    requiresChapter: 5,
    quests: [
      {
        title: "1 · Dragon Cataclysm (Special Quest)",
        tasks: [
          { kind: "find", label: "รับภารกิจจาก NPC Dragon Seal Stone", via: "Invaded Prontera · prt_q 156 188" },
          {
            kind: "kill",
            label: "Hydrolancer [Event]",
            count: 50,
            unit: "ตัว",
            via: "แผนที่ Prontera Field · เวลาที่ปรากฏ:",
            badges: ["ทุกศุกร์", "ทุกเสาร์", "ทุกอาทิตย์", "30 ต.ค. – 10 ม.ค."],
            monsterId: 1720,
          },
          {
            kind: "reward",
            label: "Black Soul",
            count: 100,
            unit: "ชิ้น",
            itemImageId: 6914,
            via: "ใช้แลกรางวัลพิเศษของกิจกรรมครบรอบ 5 ปี (ถูกลบเมื่อจบกิจกรรม)",
            exchange: { label: "World Fruit", rate: "1 : 1", itemImageId: 6435 },
            tradable: true,
          },
          {
            kind: "reward",
            label: "Jam Pancake",
            count: 50,
            unit: "ชิ้น",
            itemImageId: 592,
            via: "รักษาสถานะผิดปกติทั้งหมด เพิ่ม HP และ SP (ใช้ได้ช่วงกิจกรรม ถูกลบเมื่อจบกิจกรรม)",
          },
        ],
        notes: [
          "หลังทำเควสสำเร็จ จะมี Cooldown 4 วัน (รีเซ็ต 04:00)",
          "รับได้สูงสุด 1 เควสต่อ 4 วัน",
        ],
      },
      {
        title: "2 · World Event (Special Quest)",
        tasks: [
          {
            kind: "collect",
            label: "ส่งภารกิจ Dragon Cataclysm ที่ทำสำเร็จ",
            via: "ที่ Dragon Seal Stone · prt_q 156 188 · ส่ง 1 ครั้งนับเป็น 1",
            monsterId: 1720,
          },
        ],
        milestones: [
          {
            name: "การจุติใหม่",
            nameEn: "Reincarnation",
            target: 555,
            reward: { kind: "reward", label: "Buffer User", via: "Awake of Novice · Buffer User (ดูด้านล่าง)" },
          },
          {
            name: "บททดสอบแห่งพลัง",
            nameEn: "Trial of Strength",
            target: 5555,
            reward: { kind: "reward", label: "World Fruit", count: 20, unit: "ชิ้น/วัน", itemImageId: 6435 },
          },
          {
            name: "จุดสิ้นสุดของจุดเริ่มต้น",
            nameEn: "The End of Beginning",
            target: 55555,
            reward: { kind: "reward", label: "Echo Stone", count: 5, unit: "ชิ้น/วัน", itemImageId: 1002441 },
          },
        ],
        panels: [
          {
            title: "Awake of Novice · Buffer User",
            chips: [
              "EXP +50%",
              "JOB +50",
              "ALL STATUS +10",
              "INSURANCE 100%",
              "Criatura Cookie",
              "Recovery MHP 5%",
              "Recovery MSP 5%",
            ],
            facts: [
              { label: "Zeny ที่ใช้แลก", value: "10,000" },
              { label: "รับได้สูงสุด", value: "1 ครั้ง ต่อวัน" },
            ],
          },
        ],
        notes: [
          "ความก้าวหน้าเป็นของทั้งเซิร์ฟเวอร์ ไม่ใช่รายบุคคล",
          "เมื่อจำนวนเควส Dragon Cataclysm ทั้งเซิร์ฟเวอร์ครบเป้าหมาย ผู้เล่นทุกคนในเซิร์ฟเวอร์ได้รับรางวัลพิเศษ",
        ],
      },
    ],
  },
];
