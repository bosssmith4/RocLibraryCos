import type {
  ClassTier,
  ClassTierEntry,
  JobEntry,
  JobFamily,
  PotionOption,
  WeaponEntry,
} from "@/app/aspd-calc/types";

export const WEAPONS: WeaponEntry[] = [
  { label: "No Weapon (Bare Hand)", canOffHand: false },
  { label: "Dagger", canOffHand: true },
  { label: "One-Hand Sword", canOffHand: true },
  { label: "Two-Hand Sword", canOffHand: false },
  { label: "One-Hand Spear", canOffHand: false },
  { label: "Two-Hand Spear", canOffHand: false },
  { label: "One-Hand Axe", canOffHand: true },
  { label: "Two-Hand Axe", canOffHand: false },
  { label: "Mace", canOffHand: true },
  { label: "One-Hand Staff / Rod", canOffHand: true },
  { label: "Two-Hand Staff", canOffHand: false },
  { label: "Bow", canOffHand: false },
  { label: "Knuckle", canOffHand: false },
  { label: "Katar", canOffHand: true },
  { label: "Musical Instrument", canOffHand: false },
  { label: "Whip", canOffHand: false },
  { label: "Book", canOffHand: true },
  { label: "Huuma Shuriken", canOffHand: false },
  { label: "Handgun", canOffHand: false },
  { label: "Rifle", canOffHand: false },
  { label: "Shotgun", canOffHand: false },
  { label: "Gatling Gun", canOffHand: false },
  { label: "Grenade Launcher", canOffHand: false },
];

export const FAMILIES: JobFamily[] = [
  "Novice",
  "Swordman",
  "Acolyte",
  "Magician",
  "Merchant",
  "Archer",
  "Thief",
  "Taekwon",
  "Ninja",
  "Gunslinger",
];

export const TIER_ORDER: ClassTier[] = ["class12", "high", "extended", "awakened"];

export const CLASS_TIERS: Record<ClassTier, ClassTierEntry> = {
  class12: { label: "Class 1-2", maxASPD: 190 },
  high: { label: "High Class", maxASPD: 190 },
  extended: { label: "Extended", maxASPD: 193 },
  awakened: { label: "Awakened", maxASPD: 193 },
};

type JobRow = Omit<JobEntry, "id" | "weapons">;

const CLASS12: JobRow[] = [
  { label: "Novice", family: "Novice", tier: "class12", baseASPD: 156, shieldPenalty: -10, weaponFactors: { 1: -15, 2: -17, 6: -10, 8: -10, 9: -25 } },
  { label: "Swordman", family: "Swordman", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -7, 2: -7, 3: -14, 4: -17, 5: -25, 6: -15, 7: -20, 8: -10 } },
  { label: "Knight", family: "Swordman", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -9, 2: -5, 3: -12, 4: -15, 5: -25, 6: -10, 7: -15, 8: -5 } },
  { label: "Crusader", family: "Swordman", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -8, 2: -3, 3: -15, 4: -13, 5: -12, 6: -10, 7: -15, 8: -5 } },
  { label: "Acolyte", family: "Acolyte", tier: "class12", baseASPD: 156, shieldPenalty: -7, weaponFactors: { 8: -5, 9: -20 } },
  { label: "Priest", family: "Acolyte", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 8: -3, 9: -20, 10: -20, 12: -20, 16: -4 } },
  { label: "Monk", family: "Acolyte", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 8: -3, 9: -20, 10: -18, 12: 0 } },
  { label: "Magician", family: "Magician", tier: "class12", baseASPD: 146, shieldPenalty: -10, weaponFactors: { 1: 0, 9: -5, 10: -5 } },
  { label: "Wizard", family: "Magician", tier: "class12", baseASPD: 146, shieldPenalty: -8, weaponFactors: { 1: -4, 9: -3, 10: -3 } },
  { label: "Sage", family: "Magician", tier: "class12", baseASPD: 151, shieldPenalty: -10, weaponFactors: { 1: -8, 9: -10, 10: -10, 16: 2 } },
  { label: "Merchant", family: "Merchant", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -12, 2: -12, 6: -8, 7: -15, 8: -10 } },
  { label: "Blacksmith", family: "Merchant", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -10, 2: -10, 6: -6, 7: -13, 8: -8 } },
  { label: "Alchemist", family: "Merchant", tier: "class12", baseASPD: 156, shieldPenalty: -4, weaponFactors: { 1: -10, 2: -5, 6: -5, 7: -12, 8: -5 } },
  { label: "Archer", family: "Archer", tier: "class12", baseASPD: 156, shieldPenalty: -9, weaponFactors: { 1: -15, 11: -10 } },
  { label: "Hunter", family: "Archer", tier: "class12", baseASPD: 156, shieldPenalty: -9, weaponFactors: { 1: -13, 11: -8 } },
  { label: "Bard/Dancer", family: "Archer", tier: "class12", baseASPD: 156, shieldPenalty: -7, weaponFactors: { 1: -13, 11: -8, 14: -5, 15: -5 } },
  { label: "Thief", family: "Thief", tier: "class12", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -8, 2: -10, 6: -20, 11: -13 } },
  { label: "Assassin", family: "Thief", tier: "class12", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -2, 2: -10, 6: -11, 13: -2, 18: -10, 19: -12, 22: -12 } },
  { label: "Rogue", family: "Thief", tier: "class12", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -5, 2: -10, 6: -159, 11: -10 } },
  { label: "Taekwon", family: "Taekwon", tier: "class12", baseASPD: 156, shieldPenalty: -6, weaponFactors: {} },
  { label: "Star Gladiator", family: "Taekwon", tier: "class12", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 16: -10 } },
  { label: "Soul Linker", family: "Taekwon", tier: "class12", baseASPD: 146, shieldPenalty: -8, weaponFactors: { 1: 0, 9: -3, 10: -3 } },
  { label: "Ninja", family: "Ninja", tier: "class12", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -3, 17: -15 } },
  { label: "Gunslinger", family: "Gunslinger", tier: "class12", baseASPD: 146, shieldPenalty: -6, weaponFactors: { 18: 5, 19: -5, 20: -40, 21: 0, 22: -50 } },
];

// A High Class job uses the table of the Class 2 job it was reborn from.
const HIGH_CLASS_OF: Record<string, string> = {
  Knight: "Lord Knight",
  Crusader: "Paladin",
  Priest: "High Priest",
  Monk: "Champion",
  Wizard: "High Wizard",
  Sage: "Professor",
  Blacksmith: "Whitesmith",
  Alchemist: "Creator",
  Hunter: "Sniper",
  "Bard/Dancer": "Clown / Gypsy",
  Assassin: "Assassin Cross",
  Rogue: "Stalker",
};

const HIGH: JobRow[] = CLASS12.filter((job) => HIGH_CLASS_OF[job.label]).map((job) => ({
  ...job,
  label: HIGH_CLASS_OF[job.label],
  tier: "high",
}));

const EXTENDED: JobRow[] = [
  { label: "Expanded Super Novice", family: "Novice", tier: "extended", baseASPD: 156, shieldPenalty: -10, weaponFactors: { 1: -15, 2: -17, 3: -20, 4: -17, 5: -25, 6: -10, 7: -20, 8: -10, 9: -25, 10: -25, 11: -10, 12: -20, 13: -20, 14: -10, 15: -10, 16: -10 } },
  { label: "Kagerou", family: "Ninja", tier: "extended", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -3, 13: -2, 17: -15 } },
  { label: "Oboro", family: "Ninja", tier: "extended", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -3, 13: -2, 17: -15 } },
  { label: "Rebellion", family: "Gunslinger", tier: "extended", baseASPD: 146, shieldPenalty: -4, weaponFactors: { 18: 1, 19: -4, 20: -24, 21: 3, 22: -29 } },
];

// From the Awakened patch notes: https://roc.gnjoy.in.th/patch/awakend-skill-ragnarok-online-classic/
const AWAKENED: JobRow[] = [
  { label: "Lord Knight", family: "Swordman", tier: "awakened", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -10, 2: -12, 3: -15, 4: -8, 5: -12, 6: -18, 7: -20, 8: -5 } },
  { label: "Paladin", family: "Swordman", tier: "awakened", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -7, 2: -5, 3: -9, 4: -10, 5: -10, 6: -8, 7: -12, 8: -4 } },
  { label: "High Priest", family: "Acolyte", tier: "awakened", baseASPD: 151, shieldPenalty: -5, weaponFactors: { 8: 0, 9: -15, 10: -10, 12: -5, 16: 1 } },
  { label: "Champion", family: "Acolyte", tier: "awakened", baseASPD: 158, shieldPenalty: -5, weaponFactors: { 8: -5, 9: -10, 10: -12, 12: -1 } },
  { label: "High Wizard", family: "Magician", tier: "awakened", baseASPD: 151, shieldPenalty: -5, weaponFactors: { 1: -7, 9: -5, 10: -5 } },
  { label: "Professor", family: "Magician", tier: "awakened", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -10, 9: -5, 10: -5, 16: -5 } },
  { label: "Whitesmith", family: "Merchant", tier: "awakened", baseASPD: 156, shieldPenalty: -6, weaponFactors: { 1: -20, 2: -25, 6: -5, 7: -8, 8: -8 } },
  { label: "Creator", family: "Merchant", tier: "awakened", baseASPD: 156, shieldPenalty: -4, weaponFactors: { 1: -10, 2: -4, 6: -11, 7: -11, 8: -5 } },
  { label: "Sniper", family: "Archer", tier: "awakened", baseASPD: 156, shieldPenalty: -8, weaponFactors: { 1: -10, 11: -9 } },
  { label: "Clown / Gypsy", family: "Archer", tier: "awakened", baseASPD: 156, shieldPenalty: -7, weaponFactors: { 1: -12, 11: -10, 14: -5, 15: -5 } },
  { label: "Assassin Cross", family: "Thief", tier: "awakened", baseASPD: 156, shieldPenalty: -9, weaponFactors: { 1: -2, 2: -25, 6: -40, 13: -2 }, offHandFactors: { 1: -10, 2: -16, 6: -20 } },
  // Axe -159 is what the patch notes print (the Rogue table has the same value).
  { label: "Stalker", family: "Thief", tier: "awakened", baseASPD: 156, shieldPenalty: -5, weaponFactors: { 1: -3, 2: -7, 6: -159, 11: -2 } },
];

export const JOBS: JobEntry[] = [...CLASS12, ...HIGH, ...EXTENDED, ...AWAKENED].map((job) => ({
  ...job,
  id: `${job.tier}:${job.label}`,
  weapons: [0, ...Object.keys(job.weaponFactors).map(Number)],
}));

/** Weapons a job can hold in the left hand. Awakened jobs dual wield only where the game lists left-hand factors. */
export function offHandWeapons(job: JobEntry): number[] {
  if (job.offHandFactors) return Object.keys(job.offHandFactors).map(Number);
  if (job.tier === "awakened") return [];
  return job.weapons.filter((index) => WEAPONS[index]?.canOffHand);
}

export const POTIONS: PotionOption[] = [
  { label: "ไม่ใช้", mod: 0, assassinOnly: false },
  { label: "Concentration", mod: 0.1, assassinOnly: false },
  { label: "Awakening", mod: 0.15, assassinOnly: false },
  { label: "Berserk", mod: 0.2, assassinOnly: false },
  { label: "Poison Bottle", mod: 0.2, assassinOnly: true },
];
