import type { MonsterX3Entry, MonsterX3Event } from "@/types/monsterx3";
import main from "./main.json";

/**
 * The current round of the Monster x3 event. It lives in `main.json` alone
 * ({ title, source, multiplier, from, to, monsters: [{ id, group, exp, job }] }); a new round replaces it.
 * `from` and `to` are ISO times with the Thailand offset, such as "2026-11-04T12:00:00+07:00".
 * The page works out the multiplied EXP and JOB itself, so only the normal values go here.
 * `job` may be 0, for a monster the announcement gives no JOB.
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseEntry(raw: unknown, index: number): MonsterX3Entry {
  const where = `main.json, monsters[${index}]`;
  if (!isObject(raw)) throw new Error(`${where} is not an object`);

  const whole = (key: string, min = 1) => {
    const value = raw[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
      throw new Error(`${where} (${raw.name ?? raw.id}): "${key}" must be a whole number of ${min} or more`);
    }
    return value;
  };

  if (raw.name !== undefined && typeof raw.name !== "string") {
    throw new Error(`${where}: "name" must be text`);
  }
  if (typeof raw.group !== "string" || raw.group === "") {
    throw new Error(`${where} (${raw.name ?? raw.id}): "group" must be a non-empty text`);
  }

  return {
    id: whole("id"),
    ...(typeof raw.name === "string" ? { name: raw.name } : {}),
    group: raw.group,
    exp: whole("exp"),
    job: whole("job", 0),
  };
}

function parseEvent(raw: unknown): MonsterX3Event {
  if (!isObject(raw)) throw new Error(`main.json is not an object`);
  if (typeof raw.title !== "string" || raw.title === "") {
    throw new Error(`main.json: "title" must be a non-empty text`);
  }
  if (typeof raw.source !== "string" || !raw.source.startsWith("https://")) {
    throw new Error(`main.json: "source" must be the announcement's https address`);
  }
  if (typeof raw.multiplier !== "number" || !(raw.multiplier > 0)) {
    throw new Error(`main.json: "multiplier" must be a number above 0`);
  }

  const time = (key: "from" | "to") => {
    const value = raw[key];
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      throw new Error(`main.json: "${key}" must be an ISO time such as 2026-11-04T12:00:00+07:00`);
    }
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
      throw new Error(`main.json: "${key}" needs a time zone offset, such as +07:00`);
    }
    return value;
  };
  const from = time("from");
  const to = time("to");
  if (Date.parse(from) >= Date.parse(to)) {
    throw new Error(`main.json: "from" must be earlier than "to"`);
  }

  if (!Array.isArray(raw.monsters) || raw.monsters.length === 0) {
    throw new Error(`main.json: "monsters" must be a list with at least one monster`);
  }
  const monsters = raw.monsters.map((m, i) => parseEntry(m, i));
  const seen = new Set<number>();
  for (const m of monsters) {
    if (seen.has(m.id)) throw new Error(`main.json: monster id ${m.id} appears twice`);
    seen.add(m.id);
  }

  return { title: raw.title, source: raw.source, multiplier: raw.multiplier, from, to, monsters };
}

/** The round the page shows. */
export async function loadLatestMonsterX3Event(): Promise<MonsterX3Event> {
  return parseEvent(main);
}
