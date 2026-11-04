import type {
  ClassTier,
  ClassTierEntry,
  JobEntry,
  PotionOption,
  WeaponEntry,
} from "@/app/aspd-calc/types";

export const JOBS: JobEntry[] = [
  { label: "Novice", icon: "🎒", baseASPD: 156, shieldPenalty: -10, weapons: [0, 1, 2, 6, 8, 9], weaponFactors: { 1: -15, 2: -17, 6: -10, 8: -10, 9: -25 } },
  { label: "Swordsman", icon: "⚔️", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 3, 4, 5, 6, 7, 8], weaponFactors: { 1: -7, 2: -7, 3: -14, 4: -17, 5: -25, 6: -15, 7: -20, 8: -10 } },
  { label: "Knight", icon: "🛡️", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 3, 4, 5, 6, 7, 8], weaponFactors: { 1: -9, 2: -5, 3: -12, 4: -15, 5: -25, 6: -10, 7: -15, 8: -5 } },
  { label: "Rune Knight", icon: "🛡️", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 3, 4, 5, 6, 7, 8], weaponFactors: { 1: -10, 2: -12, 3: -15, 4: -8, 5: -12, 6: -18, 7: -20, 8: -5 } },
  { label: "Acolyte", icon: "✨", baseASPD: 156, shieldPenalty: -7, weapons: [0, 8, 9], weaponFactors: { 8: -5, 9: -20 } },
  { label: "Priest", icon: "🙏", baseASPD: 156, shieldPenalty: -5, weapons: [0, 8, 9, 10, 12, 16], weaponFactors: { 8: -3, 9: -20, 10: -20, 12: -20, 16: -4 } },
  { label: "Mage", icon: "🔮", baseASPD: 146, shieldPenalty: -10, weapons: [0, 1, 9, 10], weaponFactors: { 1: 0, 9: -5, 10: -5 } },
  { label: "Wizard", icon: "🪄", baseASPD: 146, shieldPenalty: -8, weapons: [0, 1, 9, 10], weaponFactors: { 1: -4, 9: -3, 10: -3 } },
  { label: "Merchant", icon: "💰", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 6, 7, 8], weaponFactors: { 1: -12, 2: -12, 6: -8, 7: -15, 8: -10 } },
  { label: "Blacksmith", icon: "🔨", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 6, 7, 8], weaponFactors: { 1: -10, 2: -10, 6: -6, 7: -13, 8: -8 } },
  { label: "Archer", icon: "🏹", baseASPD: 156, shieldPenalty: -9, weapons: [0, 1, 11], weaponFactors: { 1: -15, 11: -10 } },
  { label: "Hunter", icon: "🎯", baseASPD: 156, shieldPenalty: -9, weapons: [0, 1, 11], weaponFactors: { 1: -13, 11: -8 } },
  { label: "Thief", icon: "🗡️", baseASPD: 156, shieldPenalty: -6, weapons: [0, 1, 2, 6, 11], weaponFactors: { 1: -8, 2: -10, 6: -20, 11: -13 } },
  { label: "Assassin", icon: "🥷", baseASPD: 156, shieldPenalty: -6, weapons: [0, 1, 2, 6, 13, 18, 19, 22], weaponFactors: { 1: -2, 2: -10, 6: -11, 13: -2, 18: -10, 19: -12, 22: -12 } },
  { label: "Crusader", icon: "⛨", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 3, 4, 5, 6, 7, 8], weaponFactors: { 1: -8, 2: -3, 3: -15, 4: -13, 5: -12, 6: -10, 7: -15, 8: -5 } },
  { label: "Bard/Dancer", icon: "🎵", baseASPD: 156, shieldPenalty: -7, weapons: [0, 1, 11, 14, 15], weaponFactors: { 1: -13, 11: -8, 14: -5, 15: -5 } },
  { label: "Sage", icon: "📘", baseASPD: 151, shieldPenalty: -10, weapons: [0, 1, 9, 10, 16], weaponFactors: { 1: -8, 9: -10, 10: -10, 16: 2 } },
  { label: "Monk", icon: "🥊", baseASPD: 156, shieldPenalty: -5, weapons: [0, 8, 9, 10, 12], weaponFactors: { 8: -3, 9: -20, 10: -18, 12: 0 } },
  { label: "Rogue", icon: "🕶️", baseASPD: 156, shieldPenalty: -5, weapons: [0, 1, 2, 6, 11], weaponFactors: { 1: -5, 2: -10, 6: -159, 11: -10 } },
  { label: "Alchemist", icon: "⚗️", baseASPD: 156, shieldPenalty: -4, weapons: [0, 1, 2, 6, 7, 8], weaponFactors: { 1: -10, 2: -5, 6: -5, 7: -12, 8: -5 } },
  { label: "Taekwon Kid", icon: "🦶", baseASPD: 156, shieldPenalty: -6, weapons: [0], weaponFactors: {} },
  { label: "Taekwon Master", icon: "🔥", baseASPD: 156, shieldPenalty: -6, weapons: [0, 16], weaponFactors: { 16: -10 } },
  { label: "Soul Linker", icon: "👻", baseASPD: 146, shieldPenalty: -8, weapons: [0, 1, 9, 10], weaponFactors: { 1: 0, 9: -3, 10: -3 } },
  { label: "Ninja", icon: "🌪️", baseASPD: 156, shieldPenalty: -6, weapons: [0, 1, 17], weaponFactors: { 1: -3, 17: -15 } },
  { label: "Gunslinger", icon: "🔫", baseASPD: 146, shieldPenalty: -6, weapons: [0, 18, 19, 20, 21, 22], weaponFactors: { 18: 5, 19: -5, 20: -40, 21: 0, 22: -50 } },
];

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

export const CLASS_TIERS: Record<ClassTier, ClassTierEntry> = {
  class12: { label: "Class 1-2", icon: "⚔️", maxASPD: 190, available: true },
  extended: { label: "Extended Class", icon: "🌟", maxASPD: 193, available: true },
  awakened: { label: "Awakened Class", icon: "✨", maxASPD: 193, available: false },
};

export const JOBS_EXTENDED: JobEntry[] = [
  { label: "Super Extended Novice", icon: "🎒➕", baseASPD: 156, shieldPenalty: -10, weapons: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], weaponFactors: { 1: -15, 2: -17, 3: -20, 4: -17, 5: -25, 6: -10, 7: -20, 8: -10, 9: -25, 10: -25, 11: -10, 12: -20, 13: -20, 14: -10, 15: -10, 16: -10 } },
  { label: "Rebellion", icon: "🔫", baseASPD: 146, shieldPenalty: -4, weapons: [0, 18, 19, 20, 21, 22], weaponFactors: { 18: 1, 19: -4, 20: -24, 21: 3, 22: -29 } },
  { label: "Kagerou", icon: "🌙", baseASPD: 156, shieldPenalty: -6, weapons: [0, 1, 13, 17], weaponFactors: { 1: -3, 13: -2, 17: -15 } },
  { label: "Oboro", icon: "🌸", baseASPD: 156, shieldPenalty: -6, weapons: [0, 1, 13, 17], weaponFactors: { 1: -3, 13: -2, 17: -15 } },
];

export const POTIONS: PotionOption[] = [
  { label: "— ไม่ใช้ Potion —", mod: 0, assassinOnly: false },
  { label: "Concentration Potion (+10%)", mod: 0.1, assassinOnly: false },
  { label: "Awakening Potion (+15%)", mod: 0.15, assassinOnly: false },
  { label: "Berserk Potion (+20%)", mod: 0.2, assassinOnly: false },
  { label: "Poison Bottle (+20%) [AssX Only]", mod: 0.2, assassinOnly: true },
];