"use client";

import { useEffect, useRef, useState } from "react";
import {
  drawSpriteAction,
  loadSpriteAsset,
  measureSprite,
  type SpriteAsset,
} from "@/utils/spriteComposer";

/**
 * A lone .spr/.act sprite, played in a loop on a canvas: one action, each frame held for the
 * time the .act gives it. `src` is the path without extension; the picture is scaled to fit in a
 * `size` px square.
 */
export default function SpritePlayer({
  src,
  action = 0,
  size = 120,
  label,
  className,
}: {
  src: string;
  action?: number;
  size?: number;
  label: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [asset, setAsset] = useState<SpriteAsset | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSpriteAsset(src)
      .then((a) => !cancelled && setAsset(a))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const bounds = asset && measureSprite(asset, action);
    if (!asset || !canvas || !ctx || !bounds) return;

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const scale = size / Math.max(width, height, 1);
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const originX = -bounds.minX * scale;
    const originY = -bounds.minY * scale;

    const { frames, delay } = asset.act.actions[action];
    const began = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const frame = Math.floor((now - began) / Math.max(delay, 1)) % frames.length;
      drawSpriteAction(ctx, asset, action, frame, originX, originY, scale);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [asset, action, size]);

  return (
    <span
      role="img"
      aria-label={label}
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span aria-hidden className="text-4xl">
          🎰
        </span>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="max-h-full max-w-full" />
      )}
    </span>
  );
}
