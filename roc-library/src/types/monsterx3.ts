/** One monster in a Monster x3 event: its normal EXP and JOB, which the event multiplies. */
export interface MonsterX3Entry {
  /** Monster id, as in the monster database. */
  id: number;
  /** Only for the maintainer reading the file; the page shows the database's name. */
  name?: string;
  /** The area the event announcement files the monster under, such as "Sphinx". */
  group: string;
  exp: number;
  job: number;
}

/** One round of the Monster x3 (Triple Experience Mons) event. */
export interface MonsterX3Event {
  title: string;
  /** The address of the event announcement this round comes from. */
  source: string;
  /** What the event multiplies EXP and JOB by (3 for x3). */
  multiplier: number;
  /** Start of the event, an ISO time with its Thailand offset (+07:00). */
  from: string;
  /** End of the event, an ISO time with its Thailand offset (+07:00). */
  to: string;
  monsters: MonsterX3Entry[];
}
