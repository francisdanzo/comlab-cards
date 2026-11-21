import { wrapText } from '@/lib/generateCard'

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
