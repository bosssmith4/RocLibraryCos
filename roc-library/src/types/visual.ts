export interface SPRFrame {
  width: number
  height: number
  /** Palette indices (indexed frames only). */
  pixels: Uint8Array
  /** Straight RGBA, top row first (true-colour frames only). */
  rgba?: Uint8Array
}

export interface SPRData {
  palette: Uint8Array
  frames: SPRFrame[]
  /** Frames before this index are indexed; the rest are true-colour. */
  indexedCount: number
}

export interface ActLayer {
  /** Index into the indexed frames, or into the true-colour frames when spriteType is 1. */
  spriteIndex: number
  x: number
  y: number
  mirror: boolean
  /** r, g, b, a (0-255). */
  color: [number, number, number, number]
  scaleX: number
  scaleY: number
  /** Degrees. */
  rotation: number
  /** 0 = indexed, 1 = true-colour. */
  spriteType: number
}

export interface ActAnchor {
  x: number
  y: number
}

export interface ActFrame {
  layers: ActLayer[]
  anchors: ActAnchor[]
}

export interface ActAction {
  frames: ActFrame[]
  /** Milliseconds each frame stays on screen. */
  delay: number
}

export interface ActData {
  actions: ActAction[]
}

/** One keyframe of an STR effect layer. A type 1 key holds the change per frame from the type 0 key before it. */
export interface StrKey {
  frame: number
  type: number
  /** Centre of the picture on the 640×480 effect screen. */
  offset: [number, number]
  /** u, v of the top-left corner, then of the bottom-right one. */
  uv: [number, number, number, number]
  /** x of the four corners (top-left, top-right, bottom-right, bottom-left), then their y. */
  xy: number[]
  aniframe: number
  anitype: number
  delay: number
  /** 1024 units make a full turn. */
  angle: number
  /** r, g, b, a (0-255). */
  color: [number, number, number, number]
  /** Direct3D blend factors. */
  srcBlend: number
  destBlend: number
}

export interface StrLayer {
  textures: string[]
  keys: StrKey[]
}

export interface StrData {
  fps: number
  /** How many frames one loop of the effect lasts. */
  frameCount: number
  layers: StrLayer[]
}
