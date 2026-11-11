"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  Shirt,
  X,
} from "lucide-react";
import {
  CostumeInfo,
  costumeInfo,
  costumePreviewUrls,
  FootprintInfo,
  PreviewGender,
} from "@/data/costumePreview";
import {
  Bounds,
  Character,
  drawCharacter,
  Gear,
  isHeldPose,
  loadSpriteAsset,
  loadSpriteFiles,
  measureCharacter,
} from "@/utils/spriteComposer";
import {
  createStrRenderer,
  loadStrEffect,
  measureStr,
  StrEffect,
  strDuration,
  strFrameAt,
  StrRenderer,
} from "@/utils/strEffect";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 340;
const PADDING = 12;
/** Ordinary headgear is drawn at this size; large effects shrink to fit instead. */
const MAX_SCALE = 2.5;

const GENDERS: { value: PreviewGender; label: string }[] = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
];

/** An ACT holds 8 directions for each pose: action = pose type × 8 + direction. */
const IDLE = 0;
const WALK = 1;
const POSES = [
  { type: IDLE, label: "ยืน (Idle)" },
  { type: 2, label: "นั่ง (Sit)" },
  { type: WALK, label: "เดิน (Walk)" },
];

/** Direction 0 faces the viewer; each step turns the character towards the viewer's left. */
const DIRECTIONS = [
  "หน้า",
  "หน้าซ้าย",
  "ซ้าย",
  "หลังซ้าย",
  "หลัง",
  "หลังขวา",
  "ขวา",
  "หน้าขวา",
];

const ALL_ACTIONS = POSES.flatMap((p) =>
  DIRECTIONS.map((_, d) => p.type * 8 + d),
);

/**
 * The way each direction walks on screen (x right, y down), matching DIRECTIONS. The ground
 * is seen from above at a slant, so a step towards or away from the viewer looks shorter.
 */
const HEADINGS = [
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
].map(([x, y]) => {
  const length = Math.hypot(x, y);
  return [x / length, y / length] as const;
});
const GROUND_SLANT = 0.7;

/**
 * Footprint values the game's table does not always give, in sprite pixels. The table's own
 * values are taken in the same unit; what they mean is a best guess, checked against the game.
 */
const FOOTPRINT_DEFAULTS = { stride: 30, gap: 10, scale: 0.15, lift: 10 };

interface Footprint {
  info: FootprintInfo;
  /** Left foot, right foot. */
  top: [StrEffect | null, StrEffect | null];
  bottom: [StrEffect | null, StrEffect | null];
}

interface Scene {
  character: Character;
  effect?: StrEffect & { behind: boolean };
  footprint?: Footprint;
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; scene: Scene };

async function loadGear(
  urls: { spr: string; act: string } | undefined,
  sprite: CostumeInfo["sprite"],
  gender: PreviewGender,
): Promise<Gear | undefined> {
  if (!urls || !sprite) return undefined;
  const asset = await loadSpriteFiles(urls.spr, urls.act);
  return sprite.kind === "robe"
    ? { kind: "robe", asset, behind: sprite.behind?.[gender] ?? {} }
    : { kind: "headgear", asset };
}

/** A Footprint made of .str files; a footprint of pictures (PNG) is not shown. */
async function loadFootprint(
  folder: string,
  info: FootprintInfo | undefined,
): Promise<Footprint | undefined> {
  if (!info || info.Type !== "STR") return undefined;
  const load = (file: string | null) =>
    file ? loadStrEffect(folder, file) : Promise.resolve(null);
  const [topLeft, topRight, bottomLeft, bottomRight] = await Promise.all([
    load(info.StrFile_Top_Left),
    load(info.StrFile_Top_Right),
    load(info.StrFile_Bottom_Left),
    load(info.StrFile_Bottom_Right),
  ]);
  return {
    info,
    top: [topLeft, topRight],
    bottom: [bottomLeft, bottomRight],
  };
}

async function loadScene(
  patchKey: string,
  gender: PreviewGender,
): Promise<Scene> {
  const info = await costumeInfo(patchKey);
  if (!info) throw new Error(`no costume entry for ${patchKey}`);

  const url = costumePreviewUrls(patchKey, gender, info.sprite?.[gender]);
  const [body, head, gear, effect, footprint] = await Promise.all([
    loadSpriteAsset(url.body),
    loadSpriteAsset(url.head, url.hair),
    loadGear(url.gear, info.sprite, gender),
    info.effect && loadStrEffect(url.effect, info.effect.file),
    loadFootprint(url.effect, info.footprint),
  ]);
  return {
    character: { body, head, gear },
    effect: effect && info.effect && { ...effect, behind: info.effect.behind },
    footprint,
  };
}

/**
 * Paints the steps of a Footprint left so far while walking on the spot. A step is taken at
 * the start and the middle of each walk cycle, left foot first; each plays its effect once
 * and slides back the way the character came, as if the character walked on.
 */
function paintFootprint(
  renderer: StrRenderer,
  footprint: Footprint,
  { direction, cycle, elapsed }: { direction: number; cycle: number; elapsed: number },
  originX: number,
  originY: number,
  scale: number,
) {
  const { info, top, bottom } = footprint;
  const stride = info.Stride ?? FOOTPRINT_DEFAULTS.stride;
  const gap = info.Gap ?? FOOTPRINT_DEFAULTS.gap;
  const lift = (info.Height_Top ?? 0) * FOOTPRINT_DEFAULTS.lift;
  const step = cycle / 2;
  const speed = stride / step;
  const [hx, hy] = HEADINGS[direction];
  const angle = (Math.atan2(hx, -hy * GROUND_SLANT) * 180) / Math.PI;
  const lifetime = Math.max(
    0,
    ...[...top, ...bottom].map((e) => (e ? strDuration(e) : 0)),
  );

  const first = Math.max(0, Math.ceil((elapsed - lifetime) / step));
  for (let k = first; k * step <= elapsed; k++) {
    const age = elapsed - k * step;
    const foot = k % 2;
    const side = (foot === 0 ? -1 : 1) * (gap / 2);
    // On the ground: back along the heading, and to one side of it for each foot.
    const groundX = -hx * speed * age - hy * side;
    const groundY = -hy * speed * age + hx * side;
    const x = originX + groundX * scale;
    const y = originY + groundY * GROUND_SLANT * scale;

    const mark = bottom[foot];
    if (mark && age < strDuration(mark)) {
      renderer.paint(
        mark,
        strFrameAt(mark, age),
        x,
        y,
        scale * (info.Scale_Bottom ?? FOOTPRINT_DEFAULTS.scale),
        info.IsAdjustAngle ? angle : 0,
      );
    }
    const rise = top[foot];
    if (rise && age < strDuration(rise)) {
      renderer.paint(
        rise,
        strFrameAt(rise, age),
        x,
        y - lift * scale,
        scale * (info.Scale_Top ?? FOOTPRINT_DEFAULTS.scale),
      );
    }
  }
}

const union = (a: Bounds | null, b: Bounds | null): Bounds | null =>
  a && b
    ? {
        minX: Math.min(a.minX, b.minX),
        minY: Math.min(a.minY, b.minY),
        maxX: Math.max(a.maxX, b.maxX),
        maxY: Math.max(a.maxY, b.maxY),
      }
    : (a ?? b);

function PreviewCanvas({
  patchKey,
  gender,
  action,
  playing,
  onTogglePlay,
}: {
  patchKey: string;
  gender: PreviewGender;
  action: number;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** WebGL canvases for effects: under the character (Footprints, effects drawn behind) and over it. */
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  /** Milliseconds into the animation, kept so a pause resumes where it stopped. */
  const pausedAt = useRef(0);
  const [state, setState] = useState<{
    key: string;
    value: LoadState;
  }>({ key: "", value: { status: "loading" } });
  const key = `${patchKey}:${gender}`;

  useEffect(() => {
    let cancelled = false;
    loadScene(patchKey, gender)
      .then((scene) => {
        if (!cancelled) setState({ key, value: { status: "ready", scene } });
      })
      .catch(() => {
        if (!cancelled) setState({ key, value: { status: "error" } });
      });
    return () => {
      cancelled = true;
    };
  }, [patchKey, gender, key]);

  const current: LoadState =
    state.key === key ? state.value : { status: "loading" };
  const scene = current.status === "ready" ? current.scene : null;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !scene) return;
    const { character, effect, footprint } = scene;
    const back = backRef.current ? createStrRenderer(backRef.current) : null;
    const front = frontRef.current ? createStrRenderer(frontRef.current) : null;
    const effectRenderer = effect?.behind ? back : front;
    const dispose = () => {
      back?.dispose();
      front?.dispose();
    };

    // Fit everything any pose and direction paints, effects included, inside the
    // canvas, so turning or changing pose never rescales the picture.
    const fit = (b: Bounds | null) =>
      Math.min(
        MAX_SCALE,
        (CANVAS_WIDTH - PADDING * 2) / (b ? b.maxX - b.minX : 1),
        (CANVAS_HEIGHT - PADDING * 2) / (b ? b.maxY - b.minY : 1),
      );
    const characterBounds = measureCharacter(character, ALL_ACTIONS);
    const allBounds = union(
      characterBounds,
      effect ? measureStr(effect) : null,
    );
    // An effect may spread wider than the window, as it does on the game's screen; it never
    // shrinks the character below its size in the game, and the window crops the rest.
    const scale = Math.max(fit(allBounds), Math.min(1, fit(characterBounds)));
    const bounds = scale > fit(allBounds) ? characterBounds : allBounds;
    const centreX = ((bounds?.minX ?? 0) + (bounds?.maxX ?? 0)) / 2;
    const centreY = ((bounds?.minY ?? 0) + (bounds?.maxY ?? 0)) / 2;
    const originX = CANVAS_WIDTH / 2 - scale * centreX;
    const originY = CANVAS_HEIGHT / 2 - scale * centreY;

    const bodyAction = character.body.act.actions[action];
    const held = isHeldPose(character.body, action);
    // Footprints are left only while walking.
    const walking = Math.floor(action / 8) === WALK;

    const paint = (elapsed: number) => {
      const bodyFrame = held
        ? 0
        : Math.floor(elapsed / bodyAction.delay) % bodyAction.frames.length;
      drawCharacter(
        ctx,
        character,
        { action, bodyFrame, elapsed },
        originX,
        originY,
        scale,
      );
      back?.clear();
      front?.clear();
      if (back && footprint && walking) {
        paintFootprint(
          back,
          footprint,
          {
            direction: action % 8,
            cycle: bodyAction.delay * bodyAction.frames.length,
            elapsed,
          },
          originX,
          originY,
          scale,
        );
      }
      if (effectRenderer && effect) {
        effectRenderer.paint(effect, strFrameAt(effect, elapsed), originX, originY, scale);
      }
    };

    // Paused: hold the moment it stopped at.
    if (!playing) {
      paint(pausedAt.current);
      return dispose;
    }

    const start = performance.now() - pausedAt.current;
    let raf = 0;
    const tick = (now: number) => {
      // Book the next frame first, so one bad frame cannot stop the loop.
      raf = requestAnimationFrame(tick);
      pausedAt.current = now - start;
      paint(pausedAt.current);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, [scene, action, playing]);

  const lit = Boolean(scene?.effect || scene?.footprint);
  const hasBack = Boolean(scene?.footprint || scene?.effect?.behind);
  const hasFront = Boolean(scene?.effect && !scene.effect.behind);

  return (
    // An effect or a Footprint adds light onto the scene, as in the game, so it plays on a
    // dark stage; on a pale one it would wash out to white.
    <div
      // A phone gets a smaller stage, so the window leaves the page visible around it.
      className={`relative mx-auto w-60 max-w-full overflow-hidden rounded-box sm:w-[300px] ${
        lit ? "bg-neutral" : "bg-base-200"
      }`}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        role="img"
        aria-label="ตัวอย่างการสวมใส่ไอเทมบนตัวละคร"
        className="relative z-1 block h-auto w-full"
      />
      {hasBack && (
        <canvas
          ref={backRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />
      )}
      {hasFront && (
        <canvas
          ref={frontRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-2 h-full w-full"
        />
      )}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? "หยุดเล่นภาพเคลื่อนไหว" : "เล่นภาพเคลื่อนไหว"}
        className="btn btn-circle btn-sm absolute z-3 right-2 bottom-2 min-h-11 min-w-11"
      >
        {playing ? (
          <Pause aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Play aria-hidden="true" className="h-4 w-4" />
        )}
      </button>
      {current.status === "loading" && (
        <div className="absolute inset-0 z-3 flex items-center justify-center">
          <Loader2
            aria-label="กำลังโหลด"
            className="h-6 w-6 animate-spin text-base-content/60"
          />
        </div>
      )}
      {current.status === "error" && (
        <p
          role="alert"
          className="absolute inset-0 z-3 flex items-center justify-center p-4 text-center text-sm text-error"
        >
          โหลดภาพตัวอย่างไม่สำเร็จ
        </p>
      )}
    </div>
  );
}

/**
 * What the converter found for this item (a headgear, robe, effect or Footprint), costume or
 * not, so an effect item or an ordinary headgear can be previewed too; null when nothing.
 */
export function useCostumeSprite(patchKey: string) {
  const [found, setFound] = useState<{ key: string; info: CostumeInfo | null }>();

  useEffect(() => {
    let cancelled = false;
    costumeInfo(patchKey).then((info) => {
      if (!cancelled) setFound({ key: patchKey, info });
    });
    return () => {
      cancelled = true;
    };
  }, [patchKey]);

  return found?.key === patchKey ? found.info : null;
}

export function CostumePreviewButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      title="ดูไอเทมนี้สวมบนตัวละคร"
      className="btn min-h-11 flex-1 gap-2 border-accent/60 bg-accent/15 text-base-content shadow-none hover:border-accent hover:bg-accent/30 sm:flex-none"
    >
      <Shirt aria-hidden="true" className="h-5 w-5" />
      สวมใส่
    </button>
  );
}

/** On-screen only: it never takes part in the exported Item card picture. */
export function CostumePreviewModal({
  patchKey,
  name,
  startWalking = false,
  onClose,
}: {
  patchKey: string;
  name: string;
  startWalking?: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [gender, setGender] = useState<PreviewGender>("male");
  const [direction, setDirection] = useState(0);
  // A Footprint shows only while walking, so its item opens walking.
  const [poseType, setPoseType] = useState(startWalking ? WALK : IDLE);
  const [playing, setPlaying] = useState(true);
  const titleId = `costume-preview-title-${patchKey}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const turn = (step: number) =>
    setDirection((d) => (d + step + DIRECTIONS.length) % DIRECTIONS.length);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        // A focused dropdown uses the arrow keys itself.
        if (e.target instanceof HTMLSelectElement) return;
        if (e.key === "ArrowLeft") turn(1);
        if (e.key === "ArrowRight") turn(-1);
      }}
      className="modal"
    >
      <div className="modal-box max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm space-y-3 overflow-y-auto p-3 sm:max-w-md sm:space-y-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="min-w-0 pt-2 text-base font-bold sm:text-lg">
            {name}
          </h2>
          <form method="dialog">
            <button
              aria-label="ปิด"
              className="btn btn-circle btn-ghost btn-sm min-h-11 min-w-11"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </form>
        </div>

        <PreviewCanvas
          patchKey={patchKey}
          gender={gender}
          action={poseType * 8 + direction}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
        />

        {/* Phone: direction on its own row, pose and character side by side under it. */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="col-span-2 space-y-1 sm:col-span-1 sm:space-y-1.5">
            <span className="text-xs font-semibold text-base-content/70">
              ทิศทาง
            </span>
            <div className="flex items-center justify-between gap-2 rounded-box border border-base-300 p-1">
              <button
                type="button"
                onClick={() => turn(1)}
                aria-label="หันไปทางซ้าย"
                className="btn btn-ghost btn-square min-h-11 min-w-11"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <span role="status" className="text-sm font-medium">
                {DIRECTIONS[direction]}
              </span>
              <button
                type="button"
                onClick={() => turn(-1)}
                aria-label="หันไปทางขวา"
                className="btn btn-ghost btn-square min-h-11 min-w-11"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <label className="min-w-0 space-y-1 sm:space-y-1.5">
            <span className="block text-xs font-semibold text-base-content/70">
              ท่าทาง
            </span>
            <select
              value={poseType}
              onChange={(e) => setPoseType(Number(e.target.value))}
              className="select select-bordered min-h-11 w-full sm:min-h-13"
            >
              {POSES.map((p) => (
                <option key={p.type} value={p.type}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <div
            role="group"
            aria-label="เพศของตัวละคร"
            className="min-w-0 space-y-1 sm:col-span-2 sm:space-y-1.5"
          >
            <span className="block text-xs font-semibold text-base-content/70">
              ตัวละคร
            </span>
            <div className="join w-full">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  aria-pressed={gender === g.value}
                  onClick={() => setGender(g.value)}
                  className={`btn join-item min-h-11 flex-1 ${
                    gender === g.value ? "btn-primary" : ""
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button aria-label="ปิด">ปิด</button>
      </form>
    </dialog>
  );
}
