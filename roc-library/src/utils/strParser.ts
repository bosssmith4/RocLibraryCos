import { StrData, StrKey, StrLayer } from "@/types/visual"

const KEY_SIZE = 124
const NAME_SIZE = 128

/** Some effects carry a broken frame count in the header; beyond this the last keyframe decides. */
const MAX_FRAME_COUNT = 10000

const readName = (bytes: Uint8Array, offset: number) => {
  let end = offset
  while (end < offset + NAME_SIZE && bytes[end] !== 0) end++
  return new TextDecoder("euc-kr").decode(bytes.subarray(offset, end))
}

/** Reads an STR effect (version 0x94): layers of pictures moved by keyframes. */
export function parseSTR(buffer: ArrayBuffer): StrData {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  if (new TextDecoder().decode(bytes.subarray(0, 4)) !== "STRM") {
    throw new Error("Invalid STR")
  }

  const fps = view.getUint32(8, true)
  const headerFrames = view.getUint32(12, true)
  const layerCount = view.getUint32(16, true)
  let offset = 36
  let lastFrame = 0

  const float = () => {
    const v = view.getFloat32(offset, true)
    offset += 4
    return v
  }
  const int = () => {
    const v = view.getInt32(offset, true)
    offset += 4
    return v
  }

  const layers: StrLayer[] = []
  for (let l = 0; l < layerCount; l++) {
    const textures: string[] = []
    const textureCount = int()
    for (let t = 0; t < textureCount; t++) {
      textures.push(readName(bytes, offset))
      offset += NAME_SIZE
    }

    const keys: StrKey[] = []
    const keyCount = int()
    for (let k = 0; k < keyCount; k++) {
      const start = offset
      const frame = int()
      const type = int()
      const offsetXY: [number, number] = [float(), float()]
      const uv = Array.from({ length: 8 }, float)
      const xy = Array.from({ length: 8 }, float)
      const aniframe = float()
      const anitype = int()
      const delay = float()
      const angle = float()
      const color: StrKey["color"] = [float(), float(), float(), float()]
      const srcBlend = int()
      const destBlend = int()
      offset = start + KEY_SIZE

      keys.push({
        frame,
        type,
        offset: offsetXY,
        uv: [uv[0], uv[1], uv[2], uv[3]],
        xy,
        aniframe,
        anitype,
        delay,
        angle,
        color,
        srcBlend,
        destBlend,
      })
      lastFrame = Math.max(lastFrame, frame)
    }
    layers.push({ textures, keys })
  }

  return {
    fps: fps || 60,
    frameCount:
      headerFrames > 0 && headerFrames <= MAX_FRAME_COUNT
        ? headerFrames
        : lastFrame + 1,
    layers,
  }
}
