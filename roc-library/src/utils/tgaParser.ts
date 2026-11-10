/**
 * Decodes a true-colour TGA (type 2, or type 10 run-length) of 24 or 32 bits into
 * straight RGBA, top row first. Browsers cannot open TGA, which effects use for most pictures.
 */
export function parseTGA(buffer: ArrayBuffer): ImageData {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  const idLength = bytes[0]
  const type = bytes[2]
  const width = view.getUint16(12, true)
  const height = view.getUint16(14, true)
  const bpp = bytes[16]
  const topFirst = (bytes[17] & 0x20) !== 0

  if ((type !== 2 && type !== 10) || (bpp !== 24 && bpp !== 32)) {
    throw new Error(`Unsupported TGA (type ${type}, ${bpp} bit)`)
  }

  const step = bpp / 8
  const count = width * height
  // Pixels in file order: blue, green, red(, alpha).
  const raw = new Uint8Array(count * step)
  let s = 18 + idLength + (bytes[1] ? view.getUint16(5, true) * (bytes[7] / 8) : 0)

  if (type === 2) {
    raw.set(bytes.subarray(s, s + raw.length))
  } else {
    let d = 0
    while (d < raw.length && s < bytes.length) {
      const header = bytes[s++]
      const run = (header & 0x7f) + 1
      if (header & 0x80) {
        const pixel = bytes.subarray(s, s + step)
        s += step
        for (let i = 0; i < run; i++, d += step) raw.set(pixel, d)
      } else {
        raw.set(bytes.subarray(s, s + run * step), d)
        s += run * step
        d += run * step
      }
    }
  }

  const image = new ImageData(width, height)
  for (let y = 0; y < height; y++) {
    const row = topFirst ? y : height - 1 - y
    for (let x = 0; x < width; x++) {
      const from = (row * width + x) * step
      const to = (y * width + x) * 4
      image.data[to] = raw[from + 2]
      image.data[to + 1] = raw[from + 1]
      image.data[to + 2] = raw[from]
      image.data[to + 3] = step === 4 ? raw[from + 3] : 255
    }
  }
  return image
}
