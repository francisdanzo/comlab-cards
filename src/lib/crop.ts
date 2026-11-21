// A square crop window over the source image, in natural image pixels.
// `cx`/`cy` is the window centre, `size` its side. The window may be larger
// than the image (zoomed out) — the uncovered area is filled with a background.
export interface Crop {
  cx: number
  cy: number
  size: number
}

export const MAX_ZOOM = 6

// Zoom 1 = the image exactly covers the square (classic "cover" crop)
export function coverSize(w: number, h: number): number {
  return Math.min(w, h)
}

// Smallest zoom: the whole image fits inside the square ("contain")
export function minZoom(w: number, h: number): number {
  return Math.min(w, h) / Math.max(w, h)
}

export function zoomOf(crop: Crop, w: number, h: number): number {
  return coverSize(w, h) / crop.size
}

export function coverCrop(w: number, h: number): Crop {
  return { cx: w / 2, cy: h / 2, size: coverSize(w, h) }
}

function clampAxis(c: number, half: number, len: number): number {
  const lo = Math.min(half, len - half)
  const hi = Math.max(half, len - half)
  return Math.min(hi, Math.max(lo, c))
}

// Keeps the window from exposing background when zoomed in, and keeps the
// image fully inside the window when zoomed out.
export function clampCrop(crop: Crop, w: number, h: number): Crop {
  const minSize = coverSize(w, h) / MAX_ZOOM
  const maxSize = coverSize(w, h) / minZoom(w, h)
  const size = Math.min(maxSize, Math.max(minSize, crop.size))
  const half = size / 2
  return { cx: clampAxis(crop.cx, half, w), cy: clampAxis(crop.cy, half, h), size }
}

export function setZoom(crop: Crop, zoom: number, w: number, h: number): Crop {
  return clampCrop({ ...crop, size: coverSize(w, h) / zoom }, w, h)
}

// Pans by a screen-space delta, given how many screen px one image px takes
export function panCrop(crop: Crop, dx: number, dy: number, scale: number, w: number, h: number): Crop {
  return clampCrop({ ...crop, cx: crop.cx - dx / scale, cy: crop.cy - dy / scale }, w, h)
}
