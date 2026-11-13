/**
 * Builds the MVP Hunter's Route data from the game's data.grf. Run by hand after a patch:
 *
 *   node scripts/extract-navigation.mjs "D:/GAME/RO/GGT-Classic/data.grf"
 *
 * Writes public/assets/json/MapLinks.json (every Warp of the game's navigation list, the main
 * towns, and each map's name and size) and public/assets/images/minimap/<map>.webp for every map
 * on a Route from a main town to a Spawn map listed in src/services/mosters/mostersDb.tsx.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/** The main towns a Route can start from. */
const TOWNS = [
  "prontera", "izlude", "geffen", "payon", "morocc", "alberta", "aldebaran", "comodo", "yuno",
  "umbala", "amatsu", "gonryun", "louyang", "ayothaya", "xmas", "niflheim", "einbroch",
  "lighthalzen", "hugel", "rachel", "veins", "moscovia", "brasilis", "dewata", "mid_camp",
  "splendide", "manuk", "dicastes01", "malangdo", "malaya",
];
/** Maps whose Warps are left out: shortcuts an ordinary player cannot take. Edit by hand. */
const BLOCKED_MAPS = ["s_atelier"];

/** Kinds of Warp in Navi_Link that are an NPC to talk to; the rest are walked onto. */
const NPC_WARP_TYPES = [201, 204];
const MINIMAP_SIZE = 512;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONSTER_DB = path.join(ROOT, "src/services/mosters/mostersDb.tsx");
const LINKS_OUT = path.join(ROOT, "public/assets/json/MapLinks.json");
const MINIMAP_OUT = path.join(ROOT, "public/assets/images/minimap");

/* ============ GRF archive ============ */

const HEADER_SIZE = 46;
const FLAG_FILE = 1;
const FLAG_MIXED_CRYPT = 2;
const FLAG_HEADER_CRYPT = 4;

// prettier-ignore
const DES_IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
// prettier-ignore
const DES_FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
// prettier-ignore
const DES_E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
// prettier-ignore
const DES_P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
// prettier-ignore
const DES_S = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
  [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
  [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
  [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
  [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
  [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
  [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
  [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11],
];
// prettier-ignore
const SHUFFLE_SWAPS = [[0x00, 0x2b], [0x6c, 0x80], [0x01, 0x68], [0x48, 0x77], [0x60, 0xff], [0xb9, 0xc0], [0xfe, 0xeb]];
const SHUFFLE_SUBSTITUTE = new Map(SHUFFLE_SWAPS.flatMap(([a, b]) => [[a, b], [b, a]]));

const permute = (bits, table) => table.map((position) => bits[position - 1]);

/** GRF's DES: a single round with an all-zero key, on one 8-byte block in place. */
function desDecryptBlock(buf, offset) {
  const bits = [];
  for (let i = 0; i < 64; i++) bits.push((buf[offset + (i >> 3)] >> (7 - (i & 7))) & 1);
  const initial = permute(bits, DES_IP);
  const left = initial.slice(0, 32);
  const right = initial.slice(32);
  const expanded = permute(right, DES_E);
  const substituted = [];
  for (let box = 0; box < 8; box++) {
    const c = expanded.slice(box * 6, box * 6 + 6);
    const row = (c[0] << 1) | c[5];
    const column = (c[1] << 3) | (c[2] << 2) | (c[3] << 1) | c[4];
    const value = DES_S[box][row * 16 + column];
    substituted.push((value >> 3) & 1, (value >> 2) & 1, (value >> 1) & 1, value & 1);
  }
  const mixed = permute(substituted, DES_P);
  const out = permute(left.map((bit, i) => bit ^ mixed[i]).concat(right), DES_FP);
  for (let i = 0; i < 8; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | out[i * 8 + j];
    buf[offset + i] = byte;
  }
}

function unshuffleBlock(buf, offset) {
  const src = Buffer.from(buf.subarray(offset, offset + 8));
  const order = [3, 4, 6, 0, 1, 2, 5];
  order.forEach((from, to) => (buf[offset + to] = src[from]));
  buf[offset + 7] = SHUFFLE_SUBSTITUTE.get(src[7]) ?? src[7];
}

function decryptEntry(buf, flags, compressedSize) {
  const blocks = buf.length >> 3;
  for (let i = 0; i < 20 && i < blocks; i++) desDecryptBlock(buf, i * 8);
  if (!(flags & FLAG_MIXED_CRYPT)) return;

  const digits = String(compressedSize).length;
  const cycle = digits < 3 ? 1 : digits < 5 ? digits + 1 : digits < 7 ? digits + 9 : digits + 15;
  let plain = -1;
  for (let i = 20; i < blocks; i++) {
    if (i % cycle === 0) {
      desDecryptBlock(buf, i * 8);
      continue;
    }
    plain++;
    if (plain % 7 === 0 && plain !== 0) unshuffleBlock(buf, i * 8);
  }
}

/** Opens a GRF (version 0x200) and returns a reader of its files by lower-case path. */
function openGrf(grfPath) {
  const fd = fs.openSync(grfPath, "r");
  const header = Buffer.alloc(HEADER_SIZE);
  fs.readSync(fd, header, 0, HEADER_SIZE, 0);
  const version = header.readUInt32LE(42);
  if (header.toString("latin1", 0, 15) !== "Master of Magic" || version !== 0x200) {
    throw new Error(`Not a GRF 0x200 archive: ${grfPath}`);
  }
  const tableAt = header.readUInt32LE(30) + HEADER_SIZE;
  const sizes = Buffer.alloc(8);
  fs.readSync(fd, sizes, 0, 8, tableAt);
  const packed = Buffer.alloc(sizes.readUInt32LE(0));
  fs.readSync(fd, packed, 0, packed.length, tableAt + 8);
  const table = zlib.inflateSync(packed);

  const entries = new Map();
  for (let p = 0; p < table.length; ) {
    const end = table.indexOf(0, p);
    const name = table.toString("latin1", p, end).toLowerCase();
    p = end + 1;
    entries.set(name, {
      compressedSize: table.readUInt32LE(p),
      alignedSize: table.readUInt32LE(p + 4),
      flags: table[p + 12],
      offset: table.readUInt32LE(p + 13) + HEADER_SIZE,
    });
    p += 17;
  }

  return {
    /** Paths (lower-case, as stored) that match the pattern. */
    find: (pattern) => [...entries.keys()].filter((name) => pattern.test(name)),
    read(name) {
      const entry = entries.get(name.toLowerCase());
      if (!entry || !(entry.flags & FLAG_FILE)) return undefined;
      const buf = Buffer.alloc(entry.alignedSize);
      fs.readSync(fd, buf, 0, buf.length, entry.offset);
      if (entry.flags & (FLAG_MIXED_CRYPT | FLAG_HEADER_CRYPT)) {
        decryptEntry(buf, entry.flags, entry.compressedSize);
      }
      return zlib.inflateSync(buf);
    },
  };
}

/* ============ Compiled Lua (5.1) data file ============ */

const OP = { MOVE: 0, LOADK: 1, LOADBOOL: 2, LOADNIL: 3, SETGLOBAL: 7, NEWTABLE: 10, RETURN: 30, SETLIST: 34 };
const FIELDS_PER_FLUSH = 50;

/** Runs a .lub that only builds tables of constants, and returns the globals it sets. */
function readLuaTables(lub) {
  const sizeT = lub[8];
  let p = 12;
  const u32 = () => {
    p += 4;
    return lub.readUInt32LE(p - 4);
  };
  const string = () => {
    const length = sizeT === 8 ? Number(lub.readBigUInt64LE(p)) : lub.readUInt32LE(p);
    p += sizeT;
    if (!length) return null;
    p += length;
    return lub.toString("latin1", p - length, p - 1);
  };

  // main function header: source, line range, upvalues/params/vararg/stack
  string();
  p += 12;
  const code = Array.from({ length: u32() }, u32);
  const constants = Array.from({ length: u32() }, () => {
    const type = lub[p++];
    if (type === 0) return null;
    if (type === 1) return lub[p++] !== 0;
    if (type === 3) {
      p += 8;
      return lub.readDoubleLE(p - 8);
    }
    if (type === 4) return string();
    throw new Error(`Unknown Lua constant type ${type}`);
  });

  const globals = {};
  const reg = [];
  for (let pc = 0; pc < code.length; pc++) {
    const op = code[pc] & 63;
    const a = (code[pc] >>> 6) & 255;
    const c = (code[pc] >>> 14) & 511;
    const b = (code[pc] >>> 23) & 511;
    const bx = code[pc] >>> 14;
    if (op === OP.MOVE) reg[a] = reg[b];
    else if (op === OP.LOADK) reg[a] = constants[bx];
    else if (op === OP.LOADBOOL) reg[a] = b !== 0;
    else if (op === OP.LOADNIL) for (let i = a; i <= b; i++) reg[i] = null;
    else if (op === OP.SETGLOBAL) globals[constants[bx]] = reg[a];
    else if (op === OP.NEWTABLE) reg[a] = [];
    else if (op === OP.SETLIST) {
      const flush = c === 0 ? code[++pc] : c;
      const count = b === 0 ? reg.length - a - 1 : b;
      for (let i = 1; i <= count; i++) reg[a][(flush - 1) * FIELDS_PER_FLUSH + i - 1] = reg[a + i];
      reg.length = a + 1;
    } else if (op === OP.RETURN) break;
    else throw new Error(`Unsupported Lua opcode ${op}`);
  }
  return globals;
}

/* ============ Minimap picture ============ */

/** Decodes an uncompressed 8- or 24-bit BMP to RGBA, with the game's magenta made transparent. */
function bmpToRgba(bmp) {
  const dataAt = bmp.readUInt32LE(10);
  const paletteAt = 14 + bmp.readUInt32LE(14);
  const width = bmp.readInt32LE(18);
  const rawHeight = bmp.readInt32LE(22);
  const height = Math.abs(rawHeight);
  const bpp = bmp.readUInt16LE(28);
  if (bpp !== 8 && bpp !== 24) throw new Error(`Unsupported BMP depth ${bpp}`);
  const stride = Math.ceil((width * bpp) / 32) * 4;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const row = dataAt + (rawHeight > 0 ? height - 1 - y : y) * stride;
    for (let x = 0; x < width; x++) {
      const at = bpp === 8 ? paletteAt + bmp[row + x] * 4 : row + x * 3;
      const [blue, green, red] = [bmp[at], bmp[at + 1], bmp[at + 2]];
      const magenta = red > 240 && blue > 240 && green < 16;
      rgba.set(magenta ? [0, 0, 0, 0] : [red, green, blue, 255], (y * width + x) * 4);
    }
  }
  return { rgba, width, height };
}

/* ============ Main ============ */

const thai = new TextDecoder("windows-874");
const fromGameText = (latin1) => thai.decode(Buffer.from(latin1, "latin1")).trim();

/** Fewest-Warp search from one map; returns each reached map's previous map. */
function reachFrom(start, linksByMap) {
  const previous = new Map([[start, null]]);
  const queue = [start];
  while (queue.length) {
    const map = queue.shift();
    for (const link of linksByMap.get(map) ?? []) {
      if (previous.has(link[3])) continue;
      previous.set(link[3], map);
      queue.push(link[3]);
    }
  }
  return previous;
}

async function main() {
  const grfPath = process.argv[2];
  if (!grfPath) {
    console.error('Usage: node scripts/extract-navigation.mjs "<path to data.grf>"');
    process.exit(1);
  }
  const grf = openGrf(grfPath);

  // Warps: [from, x, y, to, toX, toY, npcName]; npcName is "" for a Warp that is walked onto.
  const linkFile = grf.find(/\\navigation\\navi_link_[a-z]+\.lub$/)[0];
  if (!linkFile) throw new Error("No navigation\\navi_link_*.lub in this GRF");
  const seen = new Set();
  const links = [];
  for (const row of readLuaTables(grf.read(linkFile)).Navi_Link) {
    const [from, , type, , name, , x, y, to, toX, toY] = row;
    if (!type || BLOCKED_MAPS.includes(from) || BLOCKED_MAPS.includes(to)) continue;
    const key = [from, x, y, to, toX, toY].join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    links.push([from, x, y, to, toX, toY, NPC_WARP_TYPES.includes(type) ? fromGameText(name) : ""]);
  }
  const linksByMap = new Map();
  for (const link of links) linksByMap.set(link[0], [...(linksByMap.get(link[0]) ?? []), link]);

  const mapNames = new Map();
  const nameTable = grf.read("data\\mapnametable.txt");
  for (const line of nameTable ? nameTable.toString("latin1").split(/\r?\n/) : []) {
    const match = line.match(/^([^/#]+)\.rsw#([^#]*)#/);
    if (match) mapNames.set(match[1].toLowerCase(), fromGameText(match[2]));
  }

  const spawnMaps = new Set(
    [...fs.readFileSync(MONSTER_DB, "utf8").matchAll(/\{\s*map:\s*"([^"]+)",\s*cooldown:/g)].map((m) => m[1]),
  );
  const pictured = new Set();
  for (const town of TOWNS) {
    const previous = reachFrom(town, linksByMap);
    for (const spawn of spawnMaps) {
      for (let map = spawn; map != null && previous.has(map); map = previous.get(map)) pictured.add(map);
    }
  }

  fs.mkdirSync(MINIMAP_OUT, { recursive: true });
  const minimapFolder = grf.find(/\\map\\prontera\.bmp$/)[0]?.replace(/prontera\.bmp$/, "");
  const maps = {};
  for (const map of new Set(links.flatMap((link) => [link[0], link[3]]))) {
    const gat = grf.read(`data\\${map}.gat`);
    const info = { name: mapNames.get(map) ?? map };
    if (gat) Object.assign(info, { w: gat.readUInt32LE(6), h: gat.readUInt32LE(10) });
    const bmp = pictured.has(map) && gat && minimapFolder ? grf.read(`${minimapFolder}${map}.bmp`) : undefined;
    if (bmp) {
      const { rgba, width, height } = bmpToRgba(bmp);
      await sharp(rgba, { raw: { width, height, channels: 4 } })
        .resize(MINIMAP_SIZE, MINIMAP_SIZE, { fit: "fill" })
        .webp({ quality: 80 })
        .toFile(path.join(MINIMAP_OUT, `${map}.webp`));
      info.img = 1;
    }
    maps[map] = info;
  }

  fs.writeFileSync(LINKS_OUT, JSON.stringify({ towns: TOWNS.filter((town) => maps[town]), maps, links }));

  const unreachable = [...spawnMaps].filter((map) => !reachFrom(TOWNS[0], linksByMap).has(map));
  console.log(`${links.length} Warps, ${Object.keys(maps).length} maps, ${pictured.size} minimaps`);
  console.log(`Spawn maps with no Route from ${TOWNS[0]}: ${unreachable.join(", ") || "none"}`);
}

main();
