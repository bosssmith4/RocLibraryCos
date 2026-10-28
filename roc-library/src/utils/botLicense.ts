/**
 * Issues botRedm licence keys on the server. This is the same scheme as the bot's own
 * tools/issuer.py, so the bot checks these keys with the public key it already carries:
 *
 *   BRM1-<payload>.<signature>
 *
 * The payload is compact JSON { m: machine id, n: name, iat: issued at, exp?: expires at }
 * (times in seconds), the signature is Ed25519 over the payload bytes, and both are
 * base64url without padding. Only run this on the server: it holds the private key.
 */
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import type { KeyObject } from "node:crypto";

export const KEY_PREFIX = "BRM1-";

/** Four groups of five hex characters, as the bot shows its Machine ID. */
export const MACHINE_ID_PATTERN = /^[0-9A-F]{5}(-[0-9A-F]{5}){3}$/;

export const MAX_NAME_LENGTH = 60;
/** The longest key a page visit can ask for, in days (ten years). */
export const MAX_DAYS = 3650;

/** A PKCS#8 wrapper in front of a raw 32-byte Ed25519 seed. */
const PKCS8_ED25519_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");

const b64url = (data: Buffer) => data.toString("base64url");

/** Reads the private key as `license_private.key` stores it: the 32-byte seed in base64url. */
export function parsePrivateKey(text: string): KeyObject {
  const seed = Buffer.from(text.trim(), "base64url");
  if (seed.length !== 32) throw new Error("private key must be a 32-byte Ed25519 seed");
  return createPrivateKey({
    key: Buffer.concat([PKCS8_ED25519_PREFIX, seed]),
    format: "der",
    type: "pkcs8",
  });
}

export interface IssueInput {
  machineId: string;
  name?: string;
  /** Leave out for a permanent key. */
  days?: number;
  /** Seconds since 1970; only a test passes this. */
  now?: number;
}

export interface IssuedKey {
  key: string;
  machineId: string;
  name: string;
  /** Seconds since 1970. */
  issuedAt: number;
  expiresAt: number | null;
}

export type InputCheck =
  | { ok: true; machineId: string; name: string; days: number | undefined }
  | { ok: false; message: string };

/** Cleans and checks what the form sent, with the same rules as the desktop key generator. */
export function checkInput(raw: {
  machineId?: unknown;
  name?: unknown;
  days?: unknown;
}): InputCheck {
  const machineId =
    typeof raw.machineId === "string" ? raw.machineId.replace(/\s+/g, "").toUpperCase() : "";
  if (!MACHINE_ID_PATTERN.test(machineId)) {
    return {
      ok: false,
      message:
        "รหัสเครื่องต้องเป็น 4 กลุ่ม กลุ่มละ 5 ตัวอักษร (0-9, A-F) คั่นด้วย - เช่น A1B2C-3D4E5-F6A7B-8C9D0",
    };
  }

  // Control characters would make a messy key and a broken CSV row.
  const name =
    typeof raw.name === "string"
      ? raw.name.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_NAME_LENGTH)
      : "";

  let days: number | undefined;
  if (raw.days !== undefined && raw.days !== null && String(raw.days).trim() !== "") {
    days = Number(raw.days);
    if (!Number.isFinite(days) || days <= 0 || days > MAX_DAYS) {
      return {
        ok: false,
        message: `จำนวนวันต้องเป็นตัวเลขมากกว่า 0 และไม่เกิน ${MAX_DAYS} หรือเว้นว่างเพื่อให้ถาวร`,
      };
    }
  }

  return { ok: true, machineId, name, days };
}

/** Signs a key for one machine; permanent unless `days` is given. */
export function issueKey(privateKey: KeyObject, input: IssueInput): IssuedKey {
  const now = input.now ?? Date.now() / 1000;
  const issuedAt = Math.floor(now);
  const expiresAt = input.days ? Math.floor(now + input.days * 86400) : null;
  const name = (input.name ?? "").trim();
  const machineId = input.machineId.trim().toUpperCase();

  const data: { m: string; n: string; iat: number; exp?: number } = {
    m: machineId,
    n: name,
    iat: issuedAt,
  };
  if (expiresAt !== null) data.exp = expiresAt;

  const payload = Buffer.from(JSON.stringify(data), "utf8");
  const signature = sign(null, payload, privateKey);
  return {
    key: `${KEY_PREFIX}${b64url(payload)}.${b64url(signature)}`,
    machineId,
    name,
    issuedAt,
    expiresAt,
  };
}

/** True when the key carries a signature that the matching public key accepts. */
export function keyIsSigned(key: string, privateKey: KeyObject): boolean {
  try {
    if (!key.startsWith(KEY_PREFIX)) return false;
    const [body, signature] = key.slice(KEY_PREFIX.length).split(".", 2);
    return verify(
      null,
      Buffer.from(body, "base64url"),
      createPublicKey(privateKey),
      Buffer.from(signature, "base64url"),
    );
  } catch {
    return false;
  }
}

const THAI_STAMP = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** One row of the issue log, in the same columns as the desktop tool's issued_keys.csv. */
export function logRow(issued: IssuedKey, days: number | undefined) {
  return buildLogRow(issued.issuedAt * 1000, issued.machineId, issued.name, days ? String(days) : "permanent");
}

/** Builds a log row from stored values, so rows read back from the Key record match fresh ones. */
export function buildLogRow(issuedAtMs: number, machineId: string, name: string, days: string) {
  return {
    date: THAI_STAMP.format(new Date(issuedAtMs)),
    machineId,
    // A comma in the name would shift the columns.
    name: name.replaceAll(",", " "),
    days,
  };
}
