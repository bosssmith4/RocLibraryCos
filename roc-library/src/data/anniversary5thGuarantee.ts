/** The Guarantee machine of the 5th Anniversary, from the official page. */
export const GUARANTEE_SOURCE = "https://roc.gnjoy.in.th/event/guarantee-anniversary-gacha/";

export const GUARANTEE = {
  /** shown as the game's own words */
  period: "28 ตุลาคม 2569 12.00 น. – 25 พฤศจิกายน 2569 05.59 น.",
  /** one open of a 5th Anniversary Scroll gives one Coin */
  coin: "5th Anniversary Coin",
  npc: "Garantee Gacha",
  npcAt: "prt_q 147 172",
  /** rarest first, as the official page lists them; `coins` is what the key costs */
  keys: [
    { id: "gold", name: "Anniver Gold Key77", coins: 500, grade: "SS", prize: "[Not For Sale] ระดับ SS" },
    { id: "silver", name: "Anniver Silver Key77", coins: 250, grade: "S", prize: "[Not For Sale] ระดับ S" },
  ],
  notes: [
    "ทุกการเปิด 5th Anniversary Scroll 1 ครั้ง ได้ 5th Anniversary Coin 1 ชิ้น (Must Item)",
    "Key ติดตัวละคร แลกของรางวัลได้ 1 ชิ้นต่อ Key ที่ NPC Garantee Gacha",
    "หลังหมดเวลาขาย 5th Anniversary Scroll (25 พฤศจิกายน 2569) จะไม่ได้รับ Coin อีก",
  ],
};

/** The slot machine's picture: a .spr and an .act under /assets/images/anvs/guarantee. */
export const SLOT_SPRITE = "/assets/images/anvs/guarantee/2_slot_machine";

export type GuaranteeServer = "baphomet" | "moonlight";

/** The Garantee Gacha slots each server has, named as the game names them: "Garantee Gacha V.n". */
export const GUARANTEE_SLOTS: { server: GuaranteeServer; name: string; versions: number[] }[] = [
  { server: "baphomet", name: "Baphomet", versions: [1, 2, 3, 4, 5] },
  { server: "moonlight", name: "Moonlight", versions: [1] },
];

export const slotName = (version: number) => `Garantee Gacha V.${version}`;

/**
 * Item Ids a key can be traded for, per Garantee Gacha ("<server>-<version>"): gold is the SS grade
 * (Anniver Gold Key77), silver the S grade (Anniver Silver Key77). Read from the pictures on the
 * official page and matched by name to iteminfo_new.lua, always to the [NFS] / [Not For Sale] item.
 */
export const GUARANTEE_ITEMS: Record<string, { gold: number[]; silver: number[] }> = {
  "baphomet-1": {
    gold: [420167, 400335, 400334, 490237, 410173, 460033, 490228, 400306, 480195, 410162, 400288, 420139, 480180, 490209, 480227, 490268, 460047, 480241, 490283, 490296, 400364],
    silver: [400333, 400324, 400323, 410181, 400318, 400317, 480196, 400297, 410164, 420148, 490212, 410153, 400276, 400275, 400274, 480178, 460028, 400345, 400346, 410204, 430003],
  },
  "baphomet-2": {
    gold: [490339, 490324, 400419, 490354, 490352, 490361, 480308, 400441, 490379, 410250, 510122, 400490, 490426, 420257, 460056],
    silver: [400411, 490326, 420203, 400417, 460051, 420216, 400443, 400442, 410237, 400456, 420229, 400473, 400479, 480334, 400489, 400501, 400499, 420249, 400513, 400555, 400553],
  },
  "baphomet-3": {
    gold: [490494, 490496, 490506, 490504, 490519, 410305, 490529, 490538, 400632, 480294, 490556, 490564, 490476, 470281, 470282, 15470, 410356, 500080, 470181, 490478, 490445, 490448],
    silver: [480413, 400612, 400627, 420257, 400654, 15958, 400659, 480449, 400677, 400680, 450378, 450376, 450382, 450384, 450395, 450393, 400590],
  },
  "baphomet-4": {
    gold: [490830, 490821, 490761, 490727, 490718, 490700, 490697, 490696, 490683, 490649, 490630, 490370, 410374, 420534, 420519, 420142, 490266, 420136, 540101, 510177, 590094, 550162, 510158, 800035, 500073, 21066, 18202, 700057, 500080, 21065, 18201, 500061, 830014, 28786, 26180, 26025, 570051, 580052, 1873, 28986, 840029, 610088, 500122, 620063, 500126, 630063, 13348, 510068, 510067, 28261, 490846, 490848],
    silver: [400926, 400929, 450448, 400822, 400798, 400765, 400753, 400733, 400732, 430007, 400720, 460105, 460086, 480537, 480532, 480514, 480491, 480371, 450429, 480519, 15484],
  },
  "baphomet-5": {
    gold: [401145, 401245, 401289, 401322, 401388, 401469, 401490, 401538, 490899, 490848, 490821, 490266, 480721, 420136, 22258, 620063],
    silver: [400654, 400753, 490846, 401199, 400334, 490496, 490929, 490946, 490968, 491024, 491072, 491083, 491095, 490830, 15484, 450429, 15958, 500126, 630063, 28261, 550193, 700129, 26178, 550199, 640072, 530085, 500148, 570105, 580105, 590136, 640077, 510067, 510068],
  },
  "moonlight-1": {
    gold: [400680, 490231, 490289, 490222, 490335, 490401, 490240, 490395, 490419, 420136, 420534, 420142, 15476],
    silver: [430007, 400288, 400417, 400654, 420189, 410162, 400441, 490209, 420216, 15958, 480519, 450429, 480227, 480308, 480491],
  },
};
