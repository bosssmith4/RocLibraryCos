const LINKS_URL = "/assets/json/MapLinks.json";

/** One Warp, as scripts/extract-navigation.mjs writes it: from, x, y, to, toX, toY, NPC name ("" when walked onto). */
type WarpRow = [string, number, number, string, number, number, string];

export interface MapInfo {
  name: string;
  /** size in cells; missing when the game has no walkability file for the map */
  w?: number;
  h?: number;
  /** 1 when /assets/images/minimap/<map>.webp exists */
  img?: 1;
}

export interface MapLinks {
  /** the main towns a Route can start from */
  towns: string[];
  maps: Record<string, MapInfo>;
  links: WarpRow[];
}

/** One Warp of a Route: stand at (x, y) on `map`, or talk to `npc` there, to reach `to`. */
export interface RouteStep {
  map: string;
  x: number;
  y: number;
  npc: string;
  to: string;
}

let loaded: Promise<MapLinks | undefined> | undefined;

/** The game's Warp list (public/assets/json/MapLinks.json). Loaded once; undefined when it cannot be read. */
export function mapLinks(): Promise<MapLinks | undefined> {
  loaded ??= fetch(LINKS_URL)
    .then((res) => (res.ok ? (res.json() as Promise<MapLinks>) : undefined))
    .catch(() => undefined);
  return loaded;
}

/**
 * The Route with the fewest Warps from one map to another: an empty list when they are the same
 * map, undefined when the Warp list does not connect them.
 */
export function findRoute(data: MapLinks, from: string, to: string): RouteStep[] | undefined {
  const cameBy = new Map<string, WarpRow | null>([[from, null]]);
  const queue = [from];
  for (let i = 0; i < queue.length && !cameBy.has(to); i++) {
    for (const link of data.links) {
      if (link[0] !== queue[i] || cameBy.has(link[3])) continue;
      cameBy.set(link[3], link);
      queue.push(link[3]);
    }
  }
  if (!cameBy.has(to)) return undefined;

  const steps: RouteStep[] = [];
  for (let link = cameBy.get(to); link; link = cameBy.get(link[0])) {
    steps.unshift({ map: link[0], x: link[1], y: link[2], npc: link[6], to: link[3] });
  }
  return steps;
}

/** Where a cell sits on the map's square minimap picture, as fractions from its top-left corner. */
export function minimapPosition(info: MapInfo, x: number, y: number) {
  if (!info.w || !info.h) return undefined;
  // the picture fits the longer side and centres the shorter one
  const side = Math.max(info.w, info.h);
  return {
    left: (side - info.w) / 2 / side + x / side,
    top: 1 - ((side - info.h) / 2 / side + y / side),
  };
}
