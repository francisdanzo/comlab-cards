import { centerCropParams, wrapText } from '@/lib/generateCard'

describe('centerCropParams', () => {
  it('returns full image when same aspect ratio', () => {
    const result = centerCropParams(400, 400, 400, 400)
    expect(result).toEqual({ sx: 0, sy: 0, sWidth: 400, sHeight: 400 })
  })

  it('crops width on wide image', () => {
    const result = centerCropParams(800, 400, 400, 400)
    expect(result.sy).toBe(0)
    expect(result.sHeight).toBe(400)
    expect(result.sWidth).toBe(400)
    expect(result.sx).toBe(200)
  })

  it('crops height on tall image', () => {
    const result = centerCropParams(400, 800, 400, 400)
    expect(result.sx).toBe(0)
    expect(result.sWidth).toBe(400)
    expect(result.sHeight).toBe(400)
    expect(result.sy).toBe(200)
  })
})

describe('wrapText', () => {
  const measureText = (text: string) => text.length * 10

  it('returns single line when text fits', () => {
    expect(wrapText(measureText, 'Hello World', 200)).toEqual(['Hello World'])
  })

  it('wraps long text into multiple lines', () => {
    const lines = wrapText(measureText, 'Hello World Test', 60)
    expect(lines).toEqual(['Hello', 'World', 'Test'])
  })

  it('returns empty array for empty string', () => {
    expect(wrapText(measureText, '', 200)).toEqual([])
  })
})
