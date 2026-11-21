import { MAX_ZOOM, clampCrop, coverCrop, minZoom, panCrop, setZoom, zoomOf } from '@/lib/crop'

describe('coverCrop', () => {
  it('centres a square of the shorter side on a wide image', () => {
    expect(coverCrop(800, 400)).toEqual({ cx: 400, cy: 200, size: 400 })
  })

  it('centres a square of the shorter side on a tall image', () => {
    expect(coverCrop(400, 800)).toEqual({ cx: 200, cy: 400, size: 400 })
  })

  it('is zoom 1', () => {
    expect(zoomOf(coverCrop(800, 400), 800, 400)).toBe(1)
  })
})

describe('clampCrop', () => {
  it('keeps a zoomed-in window inside the image', () => {
    expect(clampCrop({ cx: 0, cy: 1000, size: 200 }, 800, 400)).toEqual({ cx: 100, cy: 300, size: 200 })
  })

  it('keeps a zoomed-out image inside the window', () => {
    // Window 800 on a 800×400 image: x locked, y may move ±200 around centre
    expect(clampCrop({ cx: 0, cy: -500, size: 800 }, 800, 400)).toEqual({ cx: 400, cy: 0, size: 800 })
  })

  it('limits zoom between contain and MAX_ZOOM', () => {
    expect(clampCrop({ cx: 400, cy: 200, size: 10_000 }, 800, 400).size).toBe(800)
    expect(clampCrop({ cx: 400, cy: 200, size: 1 }, 800, 400).size).toBeCloseTo(400 / MAX_ZOOM)
  })
})

describe('setZoom / panCrop', () => {
  it('zooms around the current centre', () => {
    expect(setZoom(coverCrop(800, 400), 2, 800, 400)).toEqual({ cx: 400, cy: 200, size: 200 })
  })

  it('zooming out fully shows the whole image', () => {
    expect(setZoom(coverCrop(800, 400), minZoom(800, 400), 800, 400).size).toBe(800)
  })

  it('dragging right moves the window left in image space', () => {
    const crop = setZoom(coverCrop(800, 400), 2, 800, 400)
    // scale 1 screen px = 1 image px
    expect(panCrop(crop, 50, 0, 1, 800, 400).cx).toBe(350)
  })
})
