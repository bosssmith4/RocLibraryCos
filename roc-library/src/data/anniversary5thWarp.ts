/** Size of the continent picture, public/assets/images/anvs/warp/midgard.jpg, in pixels. */
export const MIDGARD_WIDTH = 986;
export const MIDGARD_HEIGHT = 925;

/** The part of the continent picture the Warp section shows: just the area around the six towns. */
export const MIDGARD_CROP = { x: 271, y: 333, width: 713, height: 592 };

export interface WarpTown {
  /** map name as the game writes it; also the name of the map's files in /assets/map */
  map: string;
  name: string;
  /** Chapter number of the town (1 to 6); the towns follow the Chapters' order */
  chapter: number;
  /** the Warp Portal NPC's cell in the town */
  x: number;
  y: number;
  /** where the town sits in the continent picture, in the picture's own pixels */
  at: { x: number; y: number };
}

/** The six main towns that have a Warp Portal NPC, in Chapter order. */
export const WARP_TOWNS: WarpTown[] = [
  { map: "izlude", name: "Izlude", chapter: 1, x: 118, y: 120, at: { x: 718, y: 603 } },
  { map: "payon", name: "Payon", chapter: 2, x: 185, y: 117, at: { x: 805, y: 708 } },
  { map: "alberta", name: "Alberta", chapter: 3, x: 102, y: 72, at: { x: 898, y: 860 } },
  { map: "geffen", name: "Geffen", chapter: 4, x: 93, y: 63, at: { x: 470, y: 505 } },
  { map: "morocc", name: "Morroc", chapter: 5, x: 180, y: 158, at: { x: 487, y: 795 } },
  { map: "prontera", name: "Prontera", chapter: 6, x: 129, y: 329, at: { x: 680, y: 560 } },
];

/** Who pays what to use the Warp Portal, as the game words it. */
export const WARP_FEES = [
  { id: "free", who: "LV 1 – 99 Class 1 , 2", fee: "ใช้บริการได้ฟรี", free: true },
  { id: "paid", who: "High Class , Extend , Awakened", fee: "5,000 Zeny / 1 ครั้ง", free: false },
];
