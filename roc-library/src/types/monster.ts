export interface Monster {
  id: number;
  name: string;
  expCurrent: number;
  expUp: number;
  jobCurrent: number;
  jobUp: number;
  map: string;
  image: string;
  lv: number;
  hp: number;
  race: string;
  property: string;
  scale: string;
  def: number;
  mdef: number;
  hit: number;
  element: ElementMonster;
  /** Spawn maps of an MVP or Mini boss; a monster without it is not on the MVP Hunter */
  mapspawn?: MapSpawn[];
  /** true for a Mini boss; a monster with mapspawn and without this is an MVP */
  miniBoss?: boolean;
}
export interface MapSpawn {
  /** map name as the game writes it, such as moc_pryd04 */
  map: string;
  /** Respawn window: shortest and longest wait after death, in minutes */
  cooldown: [number, number];
  /** hand-written end of the Route, for a map the game's Warp list does not reach */
  routeNote?: string;
  /** the last map the Warp list does reach on the way; the Route leads there and routeNote takes over */
  routeVia?: string;
}
export interface ElementMonster {
  [key: string]: number;
  neutral: number;
  water: number;
  earth: number;
  fire: number;
  wind: number;
  poison: number;
  holy: number;
  shadow: number;
  ghost: number;
  undead: number;
}
