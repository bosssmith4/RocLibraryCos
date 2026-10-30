/** A spot on a game map, as the game writes it: map name, then x and y of the cell. */
export interface MapCoordinate {
  map: string;
  x: number;
  y: number;
}

/** The maps a coordinate can open: the name to show. The key is also the name of the map's files in /assets/map. */
export const MAPS: Record<string, { name: string }> = {
  prt_q: { name: "Invaded Prontera" },
  // the six towns' Warp Portals
  izlude: { name: "Izlude" },
  payon: { name: "Payon" },
  alberta: { name: "Alberta" },
  geffen: { name: "Geffen" },
  morocc: { name: "Morroc" },
  prontera: { name: "Prontera" },
};

/** Matches "prt_q 156 188": a known map name followed by two numbers. */
const PATTERN = new RegExp(`\\b(${Object.keys(MAPS).join("|")})\\s+(\\d+)\\s+(\\d+)\\b`, "g");

/** Splits a text into plain pieces and the map coordinates found in it, in order. */
export function splitCoordinates(text: string): (string | MapCoordinate)[] {
  const pieces: (string | MapCoordinate)[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    const at = match.index ?? 0;
    if (at > last) pieces.push(text.slice(last, at));
    pieces.push({ map: match[1], x: Number(match[2]), y: Number(match[3]) });
    last = at + match[0].length;
  }
  if (last < text.length) pieces.push(text.slice(last));
  return pieces;
}

export function coordinateText({ map, x, y }: MapCoordinate): string {
  return `${map} ${x} ${y}`;
}
