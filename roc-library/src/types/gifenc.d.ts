declare module "gifenc" {
  export type Palette = number[][];

  export interface GifWriteOptions {
    /** Required on the first frame: it becomes the file's palette. */
    palette?: Palette;
    /** Milliseconds this frame shows for. */
    delay?: number;
    /** 0 loops forever (the default); -1 plays once. */
    repeat?: number;
  }

  export interface GifEncoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: GifWriteOptions,
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }

  export function GIFEncoder(): GifEncoder;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
  ): Palette;
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
  ): Uint8Array;
}
