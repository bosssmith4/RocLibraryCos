import { ActData, ActLayer, SPRData, SPRFrame } from "@/types/visual"
import { parseACT } from "@/utils/actParser"
import { parseSPR } from "@/utils/sprParser"

export interface SpriteAsset {
  spr: SPRData
  act: ActData
  /** Replaces the palette baked into the .spr (used for hair colour). */
  palette?: Uint8Array
}

export interface Character {
  body: SpriteAsset
  head: SpriteAsset
  gear: SpriteAsset
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** What to draw at one instant. */
export interface Moment {
  /** Action index of the body and head (pose type × 8 + direction). */
  action: number
  bodyFrame: number
  /** Milliseconds since the preview started, for a headgear that runs its own clock. */
  elapsed: number
}

const fetchBuffer = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.arrayBuffer()
}

export async function loadSpriteAsset(
  baseUrl: string,
  paletteUrl?: string,
): Promise<SpriteAsset> {
  const [spr, act, palette] = await Promise.all([
    fetchBuffer(`${baseUrl}.spr`),
    fetchBuffer(`${baseUrl}.act`),
    paletteUrl ? fetchBuffer(paletteUrl) : undefined,
  ])

  return {
    spr: parseSPR(spr),
    act: parseACT(act),
    palette: palette ? new Uint8Array(palette) : undefined,
  }
}

const canvasCache = new WeakMap<SPRFrame, HTMLCanvasElement>()

/** Turns one sprite frame into a canvas, treating palette index 0 as transparent. */
function frameToCanvas(
  frame: SPRFrame,
  palette: Uint8Array,
): HTMLCanvasElement {
  const cached = canvasCache.get(frame)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = frame.width
  canvas.height = frame.height
  const ctx = canvas.getContext("2d")!
  const image = ctx.createImageData(frame.width, frame.height)

  if (frame.rgba) {
    image.data.set(frame.rgba)
  } else {
    for (let i = 0; i < frame.pixels.length; i++) {
      const index = frame.pixels[i]
      if (index === 0) continue
      image.data[i * 4] = palette[index * 4]
      image.data[i * 4 + 1] = palette[index * 4 + 1]
      image.data[i * 4 + 2] = palette[index * 4 + 2]
      image.data[i * 4 + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  canvasCache.set(frame, canvas)
  return canvas
}

const tintCache = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>()

/** The picture multiplied by a layer's colour, keeping its own shape (white leaves it as it is). */
function tinted(
  source: HTMLCanvasElement,
  [r, g, b]: ActLayer["color"],
): HTMLCanvasElement {
  if (r === 255 && g === 255 && b === 255) return source

  const key = `${r},${g},${b}`
  let byColour = tintCache.get(source)
  if (!byColour) tintCache.set(source, (byColour = new Map()))
  const cached = byColour.get(key)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(source, 0, 0)
  ctx.globalCompositeOperation = "multiply"
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Multiply paints the transparent pixels too; cut back to the original shape.
  ctx.globalCompositeOperation = "destination-in"
  ctx.drawImage(source, 0, 0)

  byColour.set(key, canvas)
  return canvas
}

const layerFrame = (asset: SpriteAsset, layer: ActLayer) =>
  layer.spriteIndex < 0
    ? undefined
    : asset.spr.frames[
        layer.spriteIndex +
          (layer.spriteType === 1 ? asset.spr.indexedCount : 0)
      ]

function drawLayer(
  ctx: CanvasRenderingContext2D,
  asset: SpriteAsset,
  layer: ActLayer,
  originX: number,
  originY: number,
  offsetX: number,
  offsetY: number,
  scale: number,
) {
  const frame = layerFrame(asset, layer)
  // A zero-sized picture cannot be drawn and would throw.
  if (!frame || !frame.width || !frame.height) return

  const canvas = tinted(
    frameToCanvas(frame, asset.palette ?? asset.spr.palette),
    layer.color,
  )

  ctx.save()
  ctx.translate(
    originX + (layer.x + offsetX) * scale,
    originY + (layer.y + offsetY) * scale,
  )
  ctx.rotate((layer.rotation * Math.PI) / 180)
  ctx.scale(
    layer.scaleX * (layer.mirror ? -1 : 1) * scale,
    layer.scaleY * scale,
  )
  ctx.globalAlpha = layer.color[3] / 255
  ctx.drawImage(
    canvas,
    -Math.floor(frame.width / 2),
    -Math.floor(frame.height / 2),
  )
  ctx.restore()
}

const anchorOf = (asset: SpriteAsset, action: number, frame: number) => {
  const frames = asset.act.actions[action]?.frames
  return frames?.[frame % frames.length]?.anchors[0]
}

const anchoredCache = new WeakMap<SpriteAsset, boolean>()

/** True when any frame of the sprite names an anchor; an effect that has none is placed from the origin. */
function hasAnchors(asset: SpriteAsset) {
  let anchored = anchoredCache.get(asset)
  if (anchored === undefined) {
    anchored = asset.act.actions.some((a) =>
      a.frames.some((f) => f.anchors.length > 0),
    )
    anchoredCache.set(asset, anchored)
  }
  return anchored
}

/** A headgear with one action per pose and direction moves with the body; one with a single action is an effect. */
const followsPose = (gear: SpriteAsset) => gear.act.actions.length > 1

/** The headgear's own action: the matching one, or its only one when it has no per-pose set. */
const gearActionFor = (gear: SpriteAsset, action: number) =>
  followsPose(gear) && gear.act.actions[action] ? action : 0

/** Frame of the headgear: in step with the body, or on its own clock when it is an effect. */
function gearFrameFor(gear: SpriteAsset, action: number, moment: Moment) {
  const { frames, delay } = gear.act.actions[gearActionFor(gear, action)]
  return followsPose(gear)
    ? moment.bodyFrame % frames.length
    : Math.floor(moment.elapsed / delay) % frames.length
}

/**
 * Each sprite with the shift that hangs it on its parent. The head hangs on the body's
 * anchor and the headgear on the head's; a headgear without an anchor (an effect drawn
 * around the whole body) is placed from the character's origin instead.
 */
function placeParts(character: Character, moment: Moment) {
  const { body, head, gear } = character
  const { action, bodyFrame } = moment

  const bodyAnchor = anchorOf(body, action, bodyFrame)
  const headAnchor = anchorOf(head, action, bodyFrame)
  const headX = (bodyAnchor?.x ?? 0) - (headAnchor?.x ?? 0)
  const headY = (bodyAnchor?.y ?? 0) - (headAnchor?.y ?? 0)

  const gearAction = gearActionFor(gear, action)
  const gearFrame = gearFrameFor(gear, action, moment)
  // A frame that names no anchor sits where the head does; only a headgear with no
  // anchors at all is an effect around the body, placed from the origin.
  const gearAnchor = anchorOf(gear, gearAction, gearFrame) ?? headAnchor
  const onHead = hasAnchors(gear)

  return [
    { asset: body, action, frame: bodyFrame, x: 0, y: 0 },
    { asset: head, action, frame: bodyFrame, x: headX, y: headY },
    {
      asset: gear,
      action: gearAction,
      frame: gearFrame,
      x: onHead ? headX + (headAnchor?.x ?? 0) - (gearAnchor?.x ?? 0) : 0,
      y: onHead ? headY + (headAnchor?.y ?? 0) - (gearAnchor?.y ?? 0) : 0,
    },
  ]
}

const opaqueBoxCache = new WeakMap<
  SPRFrame,
  { x0: number; y0: number; x1: number; y1: number } | null
>()

/** The smallest rectangle (in frame pixels) that holds every visible pixel. */
function opaqueBox(frame: SPRFrame) {
  if (opaqueBoxCache.has(frame)) return opaqueBoxCache.get(frame)!

  let x0 = frame.width
  let y0 = frame.height
  let x1 = -1
  let y1 = -1

  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frame.width; x++) {
      const i = y * frame.width + x
      const visible = frame.rgba
        ? frame.rgba[i * 4 + 3] > 0
        : frame.pixels[i] !== 0
      if (!visible) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }

  const box = x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 }
  opaqueBoxCache.set(frame, box)
  return box
}

/** The area, in sprite pixels around the origin, that any of the given actions paints. */
export function measureCharacter(
  character: Character,
  actions: number[],
): Bounds | null {
  let bounds: Bounds | null = null

  for (const action of actions) {
    const bodyFrames = character.body.act.actions[action]?.frames.length ?? 0
    const gear = character.gear.act.actions[gearActionFor(character.gear, action)]
    const steps = Math.max(bodyFrames, gear.frames.length)

    for (let step = 0; step < steps; step++) {
      const moment: Moment = {
        action,
        bodyFrame: step % Math.max(bodyFrames, 1),
        elapsed: step * gear.delay,
      }

      for (const part of placeParts(character, moment)) {
        const frames = part.asset.act.actions[part.action]?.frames
        if (!frames?.length) continue

        for (const layer of frames[part.frame % frames.length].layers) {
          const frame = layerFrame(part.asset, layer)
          const box = frame && opaqueBox(frame)
          if (!frame || !box) continue

          const left = box.x0 - Math.floor(frame.width / 2)
          const right = box.x1 - Math.floor(frame.width / 2)
          const top = box.y0 - Math.floor(frame.height / 2)
          const bottom = box.y1 - Math.floor(frame.height / 2)
          const [a, b] = layer.mirror ? [-right, -left] : [left, right]

          const minX = part.x + layer.x + a * layer.scaleX
          const maxX = part.x + layer.x + b * layer.scaleX
          const minY = part.y + layer.y + top * layer.scaleY
          const maxY = part.y + layer.y + bottom * layer.scaleY

          bounds = bounds
            ? {
                minX: Math.min(bounds.minX, minX),
                minY: Math.min(bounds.minY, minY),
                maxX: Math.max(bounds.maxX, maxX),
                maxY: Math.max(bounds.maxY, maxY),
              }
            : { minX, minY, maxX, maxY }
        }
      }
    }
  }

  return bounds
}

/**
 * True when every frame of a body action shows the same body picture, which means the
 * frames only turn the head (Idle, Sit). Playing them in a loop would make the head wobble.
 */
export function isHeldPose(body: SpriteAsset, action: number) {
  const frames = body.act.actions[action]?.frames ?? []
  const picture = (f: (typeof frames)[number]) =>
    f.layers.map((l) => l.spriteIndex).join(",")
  return frames.every((f) => picture(f) === picture(frames[0]))
}

/** Draws body, head, then headgear for one moment. */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  character: Character,
  moment: Moment,
  originX: number,
  originY: number,
  scale: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.imageSmoothingEnabled = false

  for (const { asset, action, frame, x, y } of placeParts(character, moment)) {
    const frames = asset.act.actions[action]?.frames
    if (!frames?.length) continue

    for (const layer of frames[frame % frames.length].layers) {
      drawLayer(ctx, asset, layer, originX, originY, x, y, scale)
    }
  }
}

/** The area, in sprite pixels around the origin, that any frame of one action of a lone sprite paints. */
export function measureSprite(asset: SpriteAsset, action: number): Bounds | null {
  let bounds: Bounds | null = null
  for (const { layers } of asset.act.actions[action]?.frames ?? []) {
    for (const layer of layers) {
      const frame = layerFrame(asset, layer)
      const box = frame && opaqueBox(frame)
      if (!frame || !box) continue

      const left = box.x0 - Math.floor(frame.width / 2)
      const right = box.x1 - Math.floor(frame.width / 2)
      const top = box.y0 - Math.floor(frame.height / 2)
      const bottom = box.y1 - Math.floor(frame.height / 2)
      const [a, b] = layer.mirror ? [-right, -left] : [left, right]

      const minX = layer.x + a * layer.scaleX
      const maxX = layer.x + b * layer.scaleX
      const minY = layer.y + top * layer.scaleY
      const maxY = layer.y + bottom * layer.scaleY
      bounds = bounds
        ? {
            minX: Math.min(bounds.minX, minX),
            minY: Math.min(bounds.minY, minY),
            maxX: Math.max(bounds.maxX, maxX),
            maxY: Math.max(bounds.maxY, maxY),
          }
        : { minX, minY, maxX, maxY }
    }
  }
  return bounds
}

/** Draws one frame of one action of a lone sprite (an object, not a character). */
export function drawSpriteAction(
  ctx: CanvasRenderingContext2D,
  asset: SpriteAsset,
  action: number,
  frame: number,
  originX: number,
  originY: number,
  scale: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.imageSmoothingEnabled = false
  const frames = asset.act.actions[action]?.frames
  if (!frames?.length) return
  for (const layer of frames[frame % frames.length].layers) {
    drawLayer(ctx, asset, layer, originX, originY, 0, 0, scale)
  }
}
