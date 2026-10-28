"use client";
import { useEffect, useState, type ReactNode } from "react";
import { CircleHelp, Gift, MapPin, Package, Swords } from "lucide-react";
import type { QuestTask, QuestTaskKind } from "@/types/anniversary";
import { CoordinateText } from "./CoordinateLink";

const KINDS: Record<QuestTaskKind, { Icon: typeof Swords; label: string }> = {
  kill: { Icon: Swords, label: "สังหาร" },
  collect: { Icon: Package, label: "รวบรวม" },
  quiz: { Icon: CircleHelp, label: "ตอบคำถาม" },
  find: { Icon: MapPin, label: "ตามหา" },
  reward: { Icon: Gift, label: "รางวัล" },
};

/**
 * A picture that never shows a broken-image box: a missing file shows `fallback` instead,
 * and the picture stays invisible while it loads.
 */
function Picture({
  src,
  className,
  fallback,
}: {
  src: string;
  className: string;
  fallback: ReactNode;
}) {
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  // the picture may finish (or fail) before this component is interactive, so read it on mount too
  const read = (img: HTMLImageElement | null) => {
    if (img?.complete) setState(img.naturalWidth > 0 ? "ok" : "missing");
  };
  if (state === "missing") return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={read}
      src={src}
      alt=""
      aria-hidden
      onLoad={() => setState("ok")}
      onError={() => setState("missing")}
      className={`${className} ${state === "ok" ? "" : "opacity-0"}`}
    />
  );
}

/**
 * An item picture with its background removed. The game's item pictures are flat images
 * (white, or the magenta that stands for "see through"), so the colour of the top-left
 * pixel is flooded from every edge and made transparent; the item itself keeps its colours.
 * A missing file shows `fallback`; while it works, the same-sized slot stays blank.
 */
export function CutoutPicture({
  src,
  className,
  fallback,
}: {
  src: string;
  className: string;
  fallback: ReactNode;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const { naturalWidth: w, naturalHeight: h } = img;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setUrl(src);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const image = ctx.getImageData(0, 0, w, h);
      const px = image.data;
      const [br, bg, bb] = [px[0], px[1], px[2]];
      const isBackground = (p: number) =>
        Math.abs(px[p * 4] - br) + Math.abs(px[p * 4 + 1] - bg) + Math.abs(px[p * 4 + 2] - bb) < 40;
      const seen = new Uint8Array(w * h);
      const stack: number[] = [];
      const visit = (x: number, y: number) => {
        const p = y * w + x;
        if (!seen[p] && isBackground(p)) {
          seen[p] = 1;
          stack.push(p);
        }
      };
      for (let x = 0; x < w; x++) {
        visit(x, 0);
        visit(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        visit(0, y);
        visit(w - 1, y);
      }
      while (stack.length) {
        const p = stack.pop()!;
        px[p * 4 + 3] = 0;
        const x = p % w;
        const y = (p - x) / w;
        if (x > 0) visit(x - 1, y);
        if (x < w - 1) visit(x + 1, y);
        if (y > 0) visit(x, y - 1);
        if (y < h - 1) visit(x, y + 1);
      }
      ctx.putImageData(image, 0, 0);
      setUrl(canvas.toDataURL());
    };
    img.onerror = () => {
      if (!cancelled) setMissing(true);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (missing) return <>{fallback}</>;
  if (!url) return <span aria-hidden className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" aria-hidden className={className} />
  );
}

/**
 * One thing a quest asks for.
 * - A kill task: the monster picture first, then the text, then the kind icon.
 * - A collect task: the item picture first and bigger, with its background removed,
 *   then the text, then the monster that is hunted for it at the far end.
 * A missing picture falls back to the kind icon (item) or a blank slot (monster).
 */
export default function QuestTaskRow({
  task,
  largeMonster = false,
  compact = false,
}: {
  task: QuestTask;
  /** show the monster picture bigger (the World Quest) */
  largeMonster?: boolean;
  /** a small, quiet row: for a list the player only glances at, such as rewards */
  compact?: boolean;
}) {
  const { Icon, label } = KINDS[task.kind];
  const itemFirst = task.kind === "collect" || task.kind === "reward";
  // a collected item and a reward both show the item first
  const kindIcon = (className: string) => (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--anv-orange) text-(--anv-ink) ${className}`}
    >
      <Icon aria-hidden className="h-5 w-5" />
    </span>
  );
  const monsterSize = largeMonster ? "h-20 w-20" : "h-12 w-12";
  const monster = (className: string, fallback: ReactNode) =>
    task.monsterId !== undefined && (
      <Picture
        src={`/assets/images/monsterDb/${task.monsterId}.gif`}
        className={`${monsterSize} shrink-0 object-contain ${className}`}
        fallback={fallback}
      />
    );

  if (compact) {
    return (
      <li className="flex items-center gap-2 rounded-xl bg-base-100 px-2.5 py-1.5">
        {task.itemImageId !== undefined ? (
          <CutoutPicture
            src={`/assets/images/anvs/items/${task.itemImageId}.bmp`}
            className="h-8 w-8 shrink-0 object-contain"
            fallback={<Icon aria-hidden className="h-5 w-5 shrink-0 text-base-content/60" />}
          />
        ) : (
          <Icon aria-hidden className="h-5 w-5 shrink-0 text-base-content/60" />
        )}
        <p className="min-w-0 text-sm leading-snug">
          <span className="sr-only">{label}: </span>
          <span className="font-bold">{task.label}</span>
          {task.count !== undefined && (
            <span className="ml-1.5 font-black text-base-content/70">
              ×{task.count}
              {task.unit ? ` ${task.unit}` : ""}
            </span>
          )}
          {task.via && (
            <span className="block text-xs text-base-content/60">
              <CoordinateText text={task.via} />
            </span>
          )}
        </p>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-base-200 p-3">
      {itemFirst ? (
        task.itemImageId !== undefined ? (
          <CutoutPicture
            src={`/assets/images/anvs/items/${task.itemImageId}.bmp`}
            className="h-16 w-16 shrink-0 object-contain drop-shadow"
            fallback={kindIcon("")}
          />
        ) : (
          kindIcon("")
        )
      ) : (
        monster("", <span aria-hidden className={`${monsterSize} shrink-0`} />)
      )}
      <div className="min-w-0 space-y-0.5">
        <p className="font-bold leading-snug">
          <span className="sr-only">{label}: </span>
          {task.label}
          {task.count !== undefined && (
            <span className="ml-2 inline-block rounded-full bg-(--anv-ink) px-2 py-0.5 text-sm font-black text-(--anv-cream)">
              ×{task.count}
              {task.unit ? ` ${task.unit}` : ""}
            </span>
          )}
        </p>
        {task.via && (
          <p className="text-sm text-base-content/70">
            <CoordinateText text={task.via} />
          </p>
        )}
        {task.badges && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {task.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-(--anv-orange) px-3 py-0.5 text-sm font-black text-(--anv-ink)"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        {task.details?.map((line) => (
          <p key={line} className="text-xs text-base-content/60">
            {line}
          </p>
        ))}
      </div>
      {itemFirst ? monster("ml-auto", null) : kindIcon("ml-auto")}
    </li>
  );
}
