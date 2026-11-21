import { TEMPLATES, type TemplateType } from '@/config/templates'
import { cssFont, fontByKey, type NameFont } from '@/config/fonts'
import { coverCrop, type Crop } from '@/lib/crop'

export interface GenerateCardParams {
  name: string
  photo: File
  templateType?: TemplateType
  crop?: Crop
  fontKey?: string
  color?: string
  uppercase?: boolean
}

// JPEG keeps the 2508px card light enough to share from a phone
const OUTPUT_TYPE = 'image/jpeg'
const OUTPUT_QUALITY = 0.92

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

async function ensureFont(font: NameFont, sample: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  try { await document.fonts.load(cssFont(font, 40), sample) } catch { /* falls back to system font */ }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
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
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: NameFont,
  maxWidth: number,
  bandHeight: number,
  startSize: number,
  minSize: number
): { fontSize: number; lines: string[] } {
  for (let size = startSize; size >= minSize; size -= 4) {
    ctx.font = cssFont(font, size)
    const lines = wrapText((t) => ctx.measureText(t).width, text, maxWidth)
    const fitsWidth = lines.every((l) => ctx.measureText(l).width <= maxWidth)
    if (fitsWidth && lines.length * size * 1.15 <= bandHeight) return { fontSize: size, lines }
  }
  ctx.font = cssFont(font, minSize)
  const lines = wrapText((t) => ctx.measureText(t).width, text, maxWidth)
  return { fontSize: minSize, lines }
}

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const config = TEMPLATES[params.templateType ?? 'membre']
  const font = fontByKey(params.fontKey ?? '')
  const color = params.color ?? '#0B2A5B'
  const name = params.uppercase ? params.name.toLocaleUpperCase('fr-FR') : params.name

  await ensureFont(font, name)

  // Templates are same-origin — crossOrigin='anonymous' is not needed and
  // causes iOS Safari to enforce CORS headers that Vercel doesn't send for static files.
  const templateImg = await loadImage(config.templatePath)

  const canvas = document.createElement('canvas')
  canvas.width = config.canvasSize.width
  canvas.height = config.canvasSize.height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

  // FileReader avoids blob URL failures on iOS Safari / Android WebView
  const photoImg = await loadImage(await fileToDataUrl(params.photo))
  const w = photoImg.naturalWidth
  const h = photoImg.naturalHeight
  const crop = params.crop ?? coverCrop(w, h)

  // Map the user's crop window onto the photo circle
  const { photoZone: zone } = config
  const r = zone.size / 2
  const scale = zone.size / crop.size
  const dx = zone.x + r - crop.cx * scale
  const dy = zone.y + r - crop.cy * scale

  ctx.save()
  ctx.beginPath()
  ctx.arc(zone.x + r, zone.y + r, r, 0, Math.PI * 2)
  ctx.clip()
  // Background shows when the user zooms out (e.g. to fit a whole logo)
  ctx.fillStyle = zone.background
  ctx.fillRect(zone.x, zone.y, zone.size, zone.size)
  ctx.drawImage(photoImg, dx, dy, w * scale, h * scale)
  ctx.restore()

  const nameConf = config.nameText
  const { fontSize, lines } = fitText(
    ctx, name, font, nameConf.maxWidth, nameConf.bandHeight, nameConf.fontSize, nameConf.minFontSize
  )

  ctx.font = cssFont(font, fontSize)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lineHeight = fontSize * 1.15
  const blockTop = nameConf.y - (lines.length * lineHeight) / 2 + lineHeight / 2

  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = fontSize * 0.03
  ctx.lineJoin = 'round'
  lines.forEach((line, i) => {
    const y = blockTop + i * lineHeight
    if (font.stroke) ctx.strokeText(line, nameConf.x, y, nameConf.maxWidth)
    ctx.fillText(line, nameConf.x, y, nameConf.maxWidth)
  })

  // toBlob is more memory-efficient; fall back to toDataURL if unsupported or OOM
  if (typeof canvas.toBlob === 'function') {
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) { resolve(URL.createObjectURL(blob)); return }
          try { resolve(canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY)) }
          catch { reject(new Error('Génération échouée — mémoire insuffisante')) }
        },
        OUTPUT_TYPE,
        OUTPUT_QUALITY
      )
    })
  }
  return canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY)
}
