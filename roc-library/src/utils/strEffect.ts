import { StrData, StrKey, StrLayer } from "@/types/visual"
import { parseSTR } from "@/utils/strParser"
import { parseTGA } from "@/utils/tgaParser"
import type { Bounds } from "@/utils/spriteComposer"

/** The point of the 640×480 effect screen that stands on the character's feet. */
const FEET_X = 320
const FEET_Y = 240

/** A picture of an effect and the part of it (u0, v0, u1, v1) that shows on screen. */
export interface StrPicture {
  source: ImageBitmap
  visible: [number, number, number, number] | null
}

export interface StrEffect {
  str: StrData
  /** The pictures of each layer, in the layer's own order (null when a file is missing). */
  pictures: (StrPicture | null)[][]
}

/** What one layer shows at one frame. */
interface LayerState {
  picture: StrPicture
  /** The four corners (top-left, top-right, bottom-right, bottom-left) in effect pixels around the feet. */
  corners: [number, number][]
  uv: StrKey["uv"]
  color: StrKey["color"]
  srcBlend: number
  destBlend: number
}

const fetchBuffer = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.arrayBuffer()
}

const fileUrl = (base: string, name: string) =>
  `${base}/${name.split(/[\\/]/).map(encodeURIComponent).join("/")}`

/** Below this a pixel adds too little light to be seen. */
const FAINT = 16

/** The box around the pixels that show: not see-through, and not too dark to add any light. */
function visibleBox(image: ImageData): StrPicture["visible"] {
  const { width, height, data } = image
  let x0 = width
  let y0 = height
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (data[i + 3] < FAINT || Math.max(data[i], data[i + 1], data[i + 2]) < FAINT) continue
      x0 = Math.min(x0, x)
      y0 = Math.min(y0, y)
      x1 = Math.max(x1, x)
      y1 = Math.max(y1, y)
    }
  }
  return x1 < 0 ? null : [x0 / width, y0 / height, (x1 + 1) / width, (y1 + 1) / height]
}

/** Loads a picture of an effect; in a BMP the pure magenta stands for "see through". */
async function loadPicture(url: string): Promise<StrPicture | null> {
  try {
    const buffer = await fetchBuffer(url)
    let image: ImageData
    if (/\.tga$/i.test(url)) {
      image = parseTGA(buffer)
    } else {
      const bitmap = await createImageBitmap(new Blob([buffer]))
      const canvas = document.createElement("canvas")
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(bitmap, 0, 0)
      image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const px = image.data
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] > 230 && px[i + 1] < 40 && px[i + 2] > 230) px[i + 3] = 0
      }
    }
    return { source: await createImageBitmap(image), visible: visibleBox(image) }
  } catch {
    return null
  }
}

/** Loads an effect file and every picture it names (they sit beside it). */
export async function loadStrEffect(folderUrl: string, file: string): Promise<StrEffect> {
  const str = parseSTR(await fetchBuffer(fileUrl(folderUrl, file)))
  const names = [...new Set(str.layers.flatMap((l) => l.textures))]
  const loaded = new Map(
    await Promise.all(
      names.map(async (n) => [n, await loadPicture(fileUrl(folderUrl, n))] as const),
    ),
  )
  return {
    str,
    pictures: str.layers.map((l) => l.textures.map((n) => loaded.get(n) ?? null)),
  }
}

const add = (a: number[], b: number[], times: number) => a.map((v, i) => v + b[i] * times)

/**
 * The state of one layer at a frame. A type 0 key sets every value; a type 1 key at the same
 * frame right after it holds how much each value changes per frame, until the next type 0 key.
 */
function layerAt(layer: StrLayer, pictures: (StrPicture | null)[], frame: number) {
  const keys = layer.keys
  let from = -1
  let to = -1
  let lastSource = 0
  let lastFrame = 0

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key.frame <= frame) {
      if (key.type === 0) from = i
      if (key.type === 1) to = i
    }
    lastFrame = Math.max(lastFrame, key.frame)
    if (key.type === 0) lastSource = Math.max(lastSource, key.frame)
  }

  if (from < 0 || (to < 0 && lastFrame < frame)) return null

  const start = keys[from]
  let state = start
  let aniframe = start.aniframe

  if (to === from + 1 && keys[to].frame === start.frame) {
    // A change per frame runs on from its key.
    const change = keys[to]
    const delta = frame - start.frame
    const count = Math.max(pictures.length, 1)
    state = {
      ...start,
      offset: add(start.offset, change.offset, delta) as StrKey["offset"],
      uv: add(start.uv, change.uv, delta) as StrKey["uv"],
      xy: add(start.xy, change.xy, delta),
      angle: start.angle + change.angle * delta,
      color: add(start.color, change.color, delta) as StrKey["color"],
    }
    switch (start.anitype) {
      case 1:
        aniframe = start.aniframe + change.aniframe * delta
        break
      case 2:
        aniframe = Math.min(start.aniframe + change.delay * delta, count - 1)
        break
      case 3:
        aniframe = (start.aniframe + change.delay * delta) % count
        break
      case 4:
        aniframe = (((start.aniframe - change.delay * delta) % count) + count) % count
        break
    }
  } else if (to !== -1 && lastSource <= start.frame) {
    // The last set of values, with no change after it: the layer has ended.
    return null
  }

  const picture = pictures[Math.max(0, Math.min(pictures.length - 1, Math.floor(aniframe)))]
  if (!picture) return null

  const turn = (state.angle / 1024) * Math.PI * 2
  const cos = Math.cos(turn)
  const sin = Math.sin(turn)
  const corners = [0, 1, 2, 3].map((i): [number, number] => {
    const x = state.xy[i]
    const y = state.xy[i + 4]
    return [
      state.offset[0] - FEET_X + x * cos - y * sin,
      state.offset[1] - FEET_Y + x * sin + y * cos,
    ]
  })

  return {
    picture,
    corners,
    uv: state.uv,
    color: state.color.map((c) => Math.max(0, Math.min(255, c))) as StrKey["color"],
    srcBlend: state.srcBlend,
    destBlend: state.destBlend,
  } satisfies LayerState
}

/** The frame of the effect at a moment; the effect loops for as long as the item is worn. */
export const strFrameAt = (effect: StrEffect, elapsed: number) =>
  Math.floor((elapsed / 1000) * effect.str.fps) % effect.str.frameCount

/** How long the effect runs once through, in milliseconds (a Footprint plays once per step). */
export const strDuration = (effect: StrEffect) =>
  (effect.str.frameCount / effect.str.fps) * 1000

/** A point of a layer's picture (u, v in the texture) on the effect screen. */
function pointOf(state: LayerState, u: number, v: number): [number, number] {
  const [u0, v0, u1, v1] = state.uv
  // Where the point sits across the quad, from its top-left corner (0) to its bottom-right (1).
  const s = Math.max(0, Math.min(1, u1 === u0 ? 0 : (u - u0) / (u1 - u0)))
  const t = Math.max(0, Math.min(1, v1 === v0 ? 0 : (v - v0) / (v1 - v0)))
  const [tl, tr, br, bl] = state.corners
  const top = [tl[0] + (tr[0] - tl[0]) * s, tl[1] + (tr[1] - tl[1]) * s]
  const bottom = [bl[0] + (br[0] - bl[0]) * s, bl[1] + (br[1] - bl[1]) * s]
  return [top[0] + (bottom[0] - top[0]) * t, top[1] + (bottom[1] - top[1]) * t]
}

/**
 * The area, in pixels around the feet, that any frame of the effect visibly paints: only the
 * part of each picture that shows, and only while the layer is bright enough to be seen.
 */
export function measureStr(effect: StrEffect): Bounds | null {
  let bounds: Bounds | null = null
  for (let frame = 0; frame < effect.str.frameCount; frame++) {
    effect.str.layers.forEach((layer, l) => {
      const state = layerAt(layer, effect.pictures[l], frame)
      const box = state?.picture.visible
      if (!state || !box || state.color[3] < FAINT) return
      const [bu0, bv0, bu1, bv1] = box
      const points = [
        pointOf(state, bu0, bv0),
        pointOf(state, bu1, bv0),
        pointOf(state, bu1, bv1),
        pointOf(state, bu0, bv1),
      ]
      for (const [x, y] of points) {
        bounds = bounds
          ? {
              minX: Math.min(bounds.minX, x),
              minY: Math.min(bounds.minY, y),
              maxX: Math.max(bounds.maxX, x),
              maxY: Math.max(bounds.maxY, y),
            }
          : { minX: x, minY: y, maxX: x, maxY: y }
      }
    })
  }
  return bounds
}

const VERTEX = `
attribute vec2 aPos;
attribute vec2 aUv;
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vec2 clip = aPos / uSize * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = aUv;
}`

const FRAGMENT = `
precision mediump float;
uniform sampler2D uTex;
uniform vec4 uColor;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(uTex, vUv) * uColor;
}`

export interface StrRenderer {
  clear(): void
  /**
   * Adds one frame of an effect, its feet at (originX, originY), turned by `angle` degrees.
   * Several effects (each Footprint step) can be painted between two clears.
   */
  paint(
    effect: StrEffect,
    frame: number,
    originX: number,
    originY: number,
    scale: number,
    angle?: number,
  ): void
  dispose(): void
}

/**
 * Plays effects on a WebGL canvas laid over (or under) the character. The canvas is
 * transparent, so blend factors that read the picture underneath are taken as if it were
 * solid: what the game adds onto the scene is added onto the page instead.
 */
export function createStrRenderer(canvas: HTMLCanvasElement): StrRenderer | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false })
  if (!gl) return null

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  gl.useProgram(program)

  const aPos = gl.getAttribLocation(program, "aPos")
  const aUv = gl.getAttribLocation(program, "aUv")
  const uSize = gl.getUniformLocation(program, "uSize")
  const uColor = gl.getUniformLocation(program, "uColor")
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(aPos)
  gl.enableVertexAttribArray(aUv)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8)
  gl.enable(gl.BLEND)

  const textures = new Map<ImageBitmap, WebGLTexture>()
  const textureOf = (picture: ImageBitmap) => {
    let texture = textures.get(picture)
    if (!texture) {
      texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textures.set(picture, texture)
    }
    return texture
  }

  // Direct3D blend factors. The picture underneath counts as solid: its alpha is 1.
  const factor = (d3d: number, dest: boolean) => {
    switch (d3d) {
      case 1: return gl.ZERO
      case 2: return gl.ONE
      case 3: return gl.SRC_COLOR
      case 4: return gl.ONE_MINUS_SRC_COLOR
      case 5: return gl.SRC_ALPHA
      case 6: return gl.ONE_MINUS_SRC_ALPHA
      case 7: return gl.ONE
      case 8: return gl.ZERO
      case 9: return dest ? gl.ONE : gl.DST_COLOR
      case 10: return dest ? gl.ZERO : gl.ONE_MINUS_DST_COLOR
      default: return dest ? gl.ONE : gl.SRC_ALPHA
    }
  }

  return {
    clear() {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uSize, canvas.width, canvas.height)
    },
    paint(effect, frame, originX, originY, scale, angle = 0) {
      const cos = Math.cos((angle * Math.PI) / 180)
      const sin = Math.sin((angle * Math.PI) / 180)

      effect.str.layers.forEach((layer, l) => {
        const state = layerAt(layer, effect.pictures[l], frame)
        if (!state || state.color[3] <= 0) return

        const [u0, v0, u1, v1] = state.uv
        const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]
        const vertices = new Float32Array(16)
        state.corners.forEach(([x, y], i) => {
          const tx = x * cos - y * sin
          const ty = x * sin + y * cos
          vertices.set([originX + tx * scale, originY + ty * scale, uvs[i][0], uvs[i][1]], i * 4)
        })

        const destRgb = factor(state.destBlend, true)
        // Adding light keeps the page's own opacity; covering it makes the page solid there.
        const keepsPage = destRgb === gl.ONE
        gl.blendFuncSeparate(
          factor(state.srcBlend, false),
          destRgb,
          keepsPage ? gl.ZERO : gl.ONE,
          keepsPage ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA,
        )
        gl.bindTexture(gl.TEXTURE_2D, textureOf(state.picture.source))
        gl.uniform4f(uColor, ...(state.color.map((c) => c / 255) as StrKey["color"]))
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
      })
    },
    dispose() {
      textures.forEach((t) => gl.deleteTexture(t))
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}
