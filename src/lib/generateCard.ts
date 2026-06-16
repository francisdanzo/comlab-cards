import { TEMPLATES } from '@/config/templates'

export interface GenerateCardParams {
  name: string
  photo: File
  templateType: 'attendee' | 'speaker' | 'volunteer' | 'staff'
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

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Impossible de charger l'image : ${src}`))
    img.src = src
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Impossible de lire le fichier photo'))
    reader.readAsDataURL(file)
  })
}

// Shrinks fontSize until all wrapped lines fit within bandHeight and maxWidth.
// Tries sizes from startSize down to minSize in steps of 4px.
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  bandHeight: number,
  startSize: number,
  minSize = 55
): { fontSize: number; lines: string[] } {
  for (let size = startSize; size >= minSize; size -= 4) {
    ctx.font = `bold ${size}px ${fontFamily}`
    const lines = wrapText((t) => ctx.measureText(t).width, text, maxWidth)
    const totalHeight = lines.length * size * 1.2
    if (totalHeight <= bandHeight) return { fontSize: size, lines }
  }
  ctx.font = `bold ${minSize}px ${fontFamily}`
  const lines = wrapText((t) => ctx.measureText(t).width, text, maxWidth)
  return { fontSize: minSize, lines }
}

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const { name, photo, templateType } = params
  const config = TEMPLATES[templateType]

  // Templates are same-origin — crossOrigin='anonymous' is not needed and
  // causes iOS Safari to enforce CORS headers that Vercel doesn't send for static files.
  const templateImg = await loadImage(config.templatePath)

  const canvas = document.createElement('canvas')
  canvas.width = config.canvasSize.width
  canvas.height = config.canvasSize.height
  const ctx = canvas.getContext('2d')!

  // Draw template first — it is fully opaque (no transparency in photo zone)
  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

  // Draw photo on top of the template, clipped to the photo zone shape
  // FileReader avoids blob URL failures on iOS Safari / Android WebView
  const photoDataUrl = await fileToDataUrl(photo)
  const photoImg = await loadImage(photoDataUrl)

  const { photoZone } = config
  const { sx, sy, sWidth, sHeight } = centerCropParams(
    photoImg.naturalWidth,
    photoImg.naturalHeight,
    photoZone.width,
    photoZone.height
  )

  ctx.save()
  if (photoZone.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(
      photoZone.x + photoZone.width / 2,
      photoZone.y + photoZone.height / 2,
      photoZone.width / 2,
      0,
      Math.PI * 2
    )
    ctx.clip()
  }
  ctx.drawImage(photoImg, sx, sy, sWidth, sHeight, photoZone.x, photoZone.y, photoZone.width, photoZone.height)
  ctx.restore()

  // Auto-fit font size so the name always fits in the band
  const nameConf = config.nameText
  const BAND_HEIGHT = 152 // 305px at 4096 → 152px at 2048
  const { fontSize, lines } = fitText(
    ctx,
    name,
    nameConf.fontFamily,
    nameConf.maxWidth,
    BAND_HEIGHT,
    nameConf.fontSize
  )

  ctx.font = `bold ${fontSize}px ${nameConf.fontFamily}`
  ctx.fillStyle = nameConf.color
  ctx.textAlign = nameConf.align
  ctx.textBaseline = 'top'

  const lineHeight = fontSize * 1.2
  const totalHeight = lines.length * lineHeight
  const startY = nameConf.y - totalHeight / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, nameConf.x, startY + i * lineHeight)
  })

  // toBlob is more memory-efficient; fall back to toDataURL if unsupported or OOM
  if (typeof canvas.toBlob === 'function') {
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) { resolve(URL.createObjectURL(blob)); return }
          // toBlob returned null — likely OOM; fall back to toDataURL
          try { resolve(canvas.toDataURL('image/png')) }
          catch { reject(new Error('Génération échouée — mémoire insuffisante')) }
        },
        'image/png'
      )
    })
  }
  return canvas.toDataURL('image/png')
}
