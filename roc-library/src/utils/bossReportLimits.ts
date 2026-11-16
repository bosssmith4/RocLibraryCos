/** Limits and choices of a Spawn report. Shared by the form and the server, so it has no server-only imports. */
export const NAME_MAX = 50;
export const DETAIL_MIN = 3;
export const DETAIL_MAX = 500;

export const PROBLEMS = [
  { id: "map", label: "แมพที่บอสเกิดไม่ตรง", hint: "เช่น บอสเกิดที่ yuno_fild02 ไม่ใช่ที่นี่" },
  { id: "time", label: "เวลาเกิดใหม่ไม่ตรง", hint: "เช่น เกิดใหม่ทุก 60–70 นาทีจริง ๆ" },
  { id: "route", label: "เส้นทางไปแมพนี้ผิด", hint: "เช่น ต้องเดินเข้า Warp ที่ 27, 219" },
  { id: "other", label: "อื่น ๆ", hint: "เล่าสิ่งที่เห็นในเกม" },
] as const;

export type ProblemId = (typeof PROBLEMS)[number]["id"];
