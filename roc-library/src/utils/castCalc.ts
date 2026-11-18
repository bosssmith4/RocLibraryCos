export type CastInput = {
  fixedCast: number; // seconds
  fixedReduction: number; // %
  baseVct: number; // seconds
  dex: number;
  int: number;
  gearVctReduction: number; // %
  skillVctReduction: number; // %
  afterCastDelay: number; // seconds
  delayReduction: number; // %
  cooldown: number; // seconds
  cooldownReduction: number; // %
  aspd: number;
};

export type CastResult = {
  fixed: number;
  vct: number;
  statMultiplier: number;
  aspdDelay: number;
  skillDelay: number;
  delay: number;
  delaySource: "skill" | "aspd";
  total: number;
  cooldown: number;
  reuse: number;
};

export const MAX_ASPD = 200;

const pct = (value: number) => Math.min(Math.max(value, 0), 100);
const nonNeg = (value: number) => (Number.isFinite(value) ? Math.max(value, 0) : 0);

export function calcCast(input: CastInput): CastResult {
  const fixed = nonNeg(input.fixedCast) * (1 - pct(input.fixedReduction) / 100);

  const statRatio = Math.max((nonNeg(input.dex) * 2 + nonNeg(input.int)) / 530, 0);
  const statMultiplier = Math.max(1 - Math.sqrt(statRatio), 0);
  const vct =
    nonNeg(input.baseVct) *
    statMultiplier *
    (1 - pct(input.gearVctReduction) / 100) *
    (1 - pct(input.skillVctReduction) / 100);

  const aspd = Math.min(nonNeg(input.aspd), MAX_ASPD);
  const aspdDelay = (MAX_ASPD - aspd) / 50;
  const skillDelay =
    nonNeg(input.afterCastDelay) * (1 - pct(input.delayReduction) / 100);
  const delaySource = skillDelay >= aspdDelay ? "skill" : "aspd";
  const delay = Math.max(skillDelay, aspdDelay);

  const total = fixed + vct + delay;
  const cooldown = nonNeg(input.cooldown) * (1 - pct(input.cooldownReduction) / 100);

  return {
    fixed,
    vct,
    statMultiplier,
    aspdDelay,
    skillDelay,
    delay,
    delaySource,
    total,
    cooldown,
    reuse: Math.max(total, cooldown),
  };
}
