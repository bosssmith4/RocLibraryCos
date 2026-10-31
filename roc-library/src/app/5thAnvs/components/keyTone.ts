/** The colours of the Guarantee machine's keys, used everywhere a key is shown so a colour always means the same key. */
export type KeyId = "gold" | "silver";

export const KEY_TONE: Record<KeyId, { solid: string; soft: string; border: string; icon: string }> = {
  gold: {
    solid: "bg-(--key-gold) text-(--key-gold-fg)",
    soft: "bg-(--key-gold-soft)",
    border: "border-(--key-gold)",
    icon: "text-(--key-gold)",
  },
  silver: {
    solid: "bg-(--key-silver) text-(--key-silver-fg)",
    soft: "bg-(--key-silver-soft)",
    border: "border-(--key-silver)",
    icon: "text-(--key-silver)",
  },
};
