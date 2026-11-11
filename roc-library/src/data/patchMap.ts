const INDEX_URL = "/assets/json/PatchMap.json";

let index: Promise<string[]> | undefined;

/**
 * The New maps of the patch, by the name of their files in public/assets/map
 * (public/assets/json/PatchMap.json, a list of names filled in by hand). Loaded once.
 */
export function newMaps(): Promise<string[]> {
  index ??= fetch(INDEX_URL)
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => [])
    .then((names: unknown) =>
      Array.isArray(names)
        ? [...new Set(names.filter((n): n is string => typeof n === "string" && n.trim() !== ""))]
        : [],
    );
  return index;
}
