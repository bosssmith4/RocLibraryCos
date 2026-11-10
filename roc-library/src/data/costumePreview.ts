export type PreviewGender = "male" | "female";

const SPRITE_ROOT = "/assets/sprite_data";
const INDEX_URL = "/assets/json/PatchCostume.json";

/** A sprite's two files, named as in the game (a sub-folder may be part of the name). */
export interface SpriteFiles {
  spr: string;
  act: string;
}

/** A Footprint's entry from the game's footprint table, its .str files named as the converter saved them. */
export interface FootprintInfo {
  Type: "STR" | "PNG";
  /** Played at each step of the left / right foot (null = none). */
  StrFile_Top_Left: string | null;
  StrFile_Top_Right: string | null;
  /** The mark left on the ground at each step (null = none). */
  StrFile_Bottom_Left: string | null;
  StrFile_Bottom_Right: string | null;
  Scale_Top?: number;
  Scale_Bottom?: number;
  /** 1 lifts the step effect off the ground. */
  Height_Top?: number;
  /** Distance between one step and the next. */
  Stride?: number;
  /** Distance between the left and the right foot. */
  Gap?: number;
  /** Turns the ground mark to the way the character walks. */
  IsAdjustAngle?: boolean;
}

/**
 * What the converter found for one item (public/assets/json/PatchCostume.json). A sprite's
 * files sit in PatchSprite/<item id>/; an effect's or a footprint's .str and their pictures
 * sit in PatchEffect/<item id>/. Doram files may be listed too; the preview never uses them.
 */
export interface CostumeInfo {
  sprite?: {
    kind: "headgear" | "robe";
    /** Robe only: action → frames in which the robe is drawn behind the body. */
    behind?: Record<PreviewGender, Record<string, number[]>>;
  } & Partial<Record<PreviewGender, SpriteFiles>>;
  effect?: {
    file: string;
    /** Drawn before the character, so the character covers it. */
    behind: boolean;
  };
  footprint?: FootprintInfo;
}

/** A file under a folder, each part of its name encoded (the game's names are Korean). */
const fileUrl = (folder: string, name: string) =>
  `${folder}/${name.split(/[\\/]/).map(encodeURIComponent).join("/")}`;

export const costumePreviewUrls = (
  patchKey: string,
  gender: PreviewGender,
  gear?: SpriteFiles,
) => ({
  body: `${SPRITE_ROOT}/body/novice_${gender}`,
  head: `${SPRITE_ROOT}/hair/head1_${gender}`,
  hair: `${SPRITE_ROOT}/hair/color/head1_${gender}_0.pal`,
  gear: gear && {
    spr: fileUrl(`${SPRITE_ROOT}/PatchSprite/${patchKey}`, gear.spr),
    act: fileUrl(`${SPRITE_ROOT}/PatchSprite/${patchKey}`, gear.act),
  },
  effect: `${SPRITE_ROOT}/PatchEffect/${patchKey}`,
});

let index: Promise<Record<string, CostumeInfo>> | undefined;

/** The item's entry, or null when it has nothing to preview (loaded once for every item). */
export function costumeInfo(patchKey: string): Promise<CostumeInfo | null> {
  index ??= fetch(INDEX_URL)
    .then((res) => (res.ok ? res.json() : {}))
    .catch(() => ({}));
  return index.then((all) => all[patchKey] ?? null);
}
