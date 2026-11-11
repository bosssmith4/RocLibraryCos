const INDEX_URL = "/assets/json/PatchCard.json";
const ILLUSTRATION_ROOT = "/assets/images/PatchCard";

let index: Promise<Record<string, string>> | undefined;

/**
 * Item id → URL of its Card illustration, for every card of the patch
 * (public/assets/json/PatchCard.json names each card's file in PatchCard/<item id>/).
 * Loaded once; an item missing from it is not a card, whatever its name says.
 */
export function cardIllustrations(): Promise<Record<string, string>> {
  index ??= fetch(INDEX_URL)
    .then((res) => (res.ok ? res.json() : {}))
    .catch(() => ({}))
    .then((files: Record<string, string>) =>
      Object.fromEntries(
        Object.entries(files).map(([id, file]) => [
          id,
          `${ILLUSTRATION_ROOT}/${id}/${encodeURIComponent(file)}`,
        ]),
      ),
    );
  return index;
}
