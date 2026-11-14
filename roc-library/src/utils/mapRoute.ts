const LINKS_URL = "/assets/json/MapLinks.json";

/**
 * One Warp, as scripts/extract-navigation.mjs writes it: from, x, y, to, toX, toY, NPC name ("" when walked onto).
 * A Gate Warp row carries two more: the choice to pick in the NPC's menu and its price in Zeny.
 */
type WarpRow = [string, number, number, string, number, number, string, string?, number?];

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
  /** Gate Warp only: the choice to pick in the NPC's menu */
  choice?: string;
  /** Gate Warp only: what the Warp costs, in Zeny */
  zeny?: number;
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
 * The Route with the fewest Warps from one map to another, the one that costs less Zeny when two
 * are as short: an empty list when they are the same map, undefined when the Warp list does not
 * connect them.
 */
export function findRoute(data: MapLinks, from: string, to: string): RouteStep[] | undefined {
  const best = new Map<string, { link: WarpRow | null; zeny: number }>([[from, { link: null, zeny: 0 }]]);
  // one round per Warp taken: every map of a round is as far, so only its Zeny can still improve
  for (let round = [from]; round.length && !best.has(to); ) {
    const next: string[] = [];
    for (const map of round) {
      const spent = best.get(map)?.zeny ?? 0;
      for (const link of data.links) {
        if (link[0] !== map) continue;
        const zeny = spent + (link[8] ?? 0);
        const known = best.get(link[3]);
        if (!known) next.push(link[3]);
        else if (!next.includes(link[3]) || known.zeny <= zeny) continue;
        best.set(link[3], { link, zeny });
      }
    }
    round = next;
  }
  if (!best.has(to)) return undefined;

  const steps: RouteStep[] = [];
  for (let link = best.get(to)?.link; link; link = best.get(link[0])?.link) {
    steps.unshift({ map: link[0], x: link[1], y: link[2], npc: link[6], to: link[3], choice: link[7], zeny: link[8] });
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
