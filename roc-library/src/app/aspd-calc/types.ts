export type ClassTier = "class12" | "high" | "extended" | "awakened";

export type JobFamily =
  | "Novice"
  | "Swordman"
  | "Acolyte"
  | "Magician"
  | "Merchant"
  | "Archer"
  | "Thief"
  | "Taekwon"
  | "Ninja"
  | "Gunslinger";

export interface JobEntry {
  /** Unique across tiers, e.g. "high:Lord Knight" and "awakened:Lord Knight" */
  id: string;
  label: string;
  family: JobFamily;
  tier: ClassTier;
  baseASPD: number;
  shieldPenalty: number;
  /** Indexes into WEAPONS that the job can hold (0 = bare hand) */
  weapons: number[];
  weaponFactors: Record<number, number>;
  /** Left-hand factors, for a job whose table lists them apart from the right hand */
  offHandFactors?: Record<number, number>;
}

export interface WeaponEntry {
  label: string;
  canOffHand: boolean;
}

export interface ClassTierEntry {
  label: string;
  maxASPD: number;
}

export interface PotionOption {
  label: string;
  mod: number;
  assassinOnly: boolean;
}

export type OffHandSelection = "none" | "shield" | `w:${number}`;

export interface AspdInput {
  family: JobFamily;
  jobId: string;
  weaponIdx: number;
  offHand: OffHandSelection;
  agiBase: number;
  agiBonus: number;
  dexBase: number;
  dexBonus: number;
  potionIdx: number;
  skillPct: number;
  equipPct: number;
  flatASPD: number;
  targetASPD: number;
}

export interface AspdCalculationResult {
  jobWeaponBase: number;
  aspdPenalty: number;
  aspdCorrection: number;
  statTerm: number;
  baseCase: number;
  bonusTotal: number;
  baseASPD: number;
  equipContrib: number;
  afterEquipASPD: number;
  finalRaw: number;
  /** Final ASPD to 2 decimals, after the class cap */
  finalExact: number;
  /** Final ASPD as the game shows it: a whole number, after the class cap */
  final: number;
}

export interface ResultPanelProps {
  tierLabel: string;
  maxASPD: number;
  result: AspdCalculationResult;
}

export interface ReverseCalcPanelProps {
  currentASPD: number;
  maxASPD: number;
  targetASPD: number;
  agi: number;
  dex: number;
  reverseCalc: ReverseCalcResult;
  onTargetChange: (value: number) => void;
}

export interface FormulaBreakdownPanelProps {
  result: AspdCalculationResult;
  jobBaseASPD: number;
  weaponFactor: number;
  offHandFactor: number;
  agi: number;
  dex: number;
  potionMod: number;
  skillPct: number;
  equipPct: number;
  flatASPD: number;
  maxASPD: number;
}

export interface ReverseCalcResult {
  agiNeeded: number | null;
  dexNeeded: number | null;
}
