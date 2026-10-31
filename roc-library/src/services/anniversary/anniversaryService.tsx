import { useEffect, useState } from "react";
import { PatchItemsDto } from "@/types/patch";
import type {
  AnniversaryRewardType,
  AnniversaryServer,
} from "@/types/anniversary";

export const ANNIVERSARY_SERVERS: {
  id: AnniversaryServer;
  name: string;
  /** folder name under /assets/images/anvs */
  imageDir: string;
}[] = [
  { id: "baphomet", name: "Baphomet", imageDir: "baphomet" },
  { id: "moonlight", name: "Moonlight", imageDir: "moonlight" },
];

/** What one exchange costs, the same for every Anniversary reward. */
export const EXCHANGE_COST = { gachaTickets: 1, zeny: 1_000_000 };

/** One [NFS] Gacha Ticket is worth this many World Fruit. */
export { WORLD_FRUIT_PER_TICKET } from "@/data/anniversary5thGuide";

export const REWARD_TYPES: { id: AnniversaryRewardType; name: string }[] = [
  { id: "headGear", name: "Header Gear" },
  { id: "accessory", name: "Accessory" },
];

/** Reads the "ประเภท : X" line of the item description: Headgear/Helm are Header Gear, anything else is Accessory. */
export function rewardTypeOf(item: PatchItemsDto): AnniversaryRewardType {
  const text = item.identifiedDescriptionName.join(" ");
  const kind = /ประเภท : (\S+)/.exec(text)?.[1] ?? "";
  return kind === "Headgear" || kind === "Helm" ? "headGear" : "accessory";
}

/** Item name with its slot count, e.g. "[NFS] Heaven Cage [1]"; no suffix when it has no slot. */
export function rewardLabel(item: PatchItemsDto): string {
  return item.slotCount > 0
    ? `${item.identifiedDisplayName} [${item.slotCount}]`
    : item.identifiedDisplayName;
}

type RewardItems = Record<string, PatchItemsDto>;

/**
 * Loads the rewards of every server once, so switching server is instant
 * (no loading state) and warms the browser cache with the pictures.
 */
export function useAnniversaryRewards(server: AnniversaryServer) {
  const [all, setAll] = useState<Partial<Record<AnniversaryServer, RewardItems>>>({});
  const [errors, setErrors] = useState<Partial<Record<AnniversaryServer, string>>>({});

  useEffect(() => {
    let cancelled = false;
    for (const { id, imageDir } of ANNIVERSARY_SERVERS) {
      fetch(`/assets/json/anvs_reward_${id}.json`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load JSON");
          return res.json();
        })
        .then((items: RewardItems) => {
          if (cancelled) return;
          setAll((prev) => ({ ...prev, [id]: items }));
          for (const itemId of Object.keys(items)) {
            new Image().src = `/assets/images/anvs/${imageDir}/${itemId}.bmp`;
          }
        })
        .catch((err) => {
          if (!cancelled) setErrors((prev) => ({ ...prev, [id]: err.message }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const items = all[server];
  const error = errors[server] ?? null;
  return { items: items ?? {}, loading: !items && !error, error };
}

/** Where the pictures of the Guarantee machine's items are: /assets/images/anvs/guarantee/<item id>.bmp */
export const guaranteeImage = (id: string | number) => `/assets/images/anvs/guarantee/${id}.bmp`;

/** Loads the items that the Guarantee machine's keys can be traded for, once: [item id] → item. */
export function useGuaranteeItems() {
  const [items, setItems] = useState<Record<string, PatchItemsDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/assets/json/guarantee_anvs.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load JSON");
        return res.json();
      })
      .then((data: Record<string, PatchItemsDto>) => !cancelled && setItems(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return { items: items ?? {}, loading: !items && !error, error };
}
