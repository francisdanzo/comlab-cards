export interface GenerateCardParams {
  name: string
  domain: string
  photo: File
  templateType: 'attendee' | 'speaker' | 'volunteer'
}

export function centerCropParams(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
  const sWidth = targetWidth / scale
  const sHeight = targetHeight / scale
  const sx = (imgWidth - sWidth) / 2
  const sy = (imgHeight - sHeight) / 2
  return { sx, sy, sWidth, sHeight }
}

export function wrapText(
  measureText: (text: string) => number,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (measureText(test) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function generateCard(_params: GenerateCardParams): Promise<string> {
  throw new Error('Not implemented yet')
}
