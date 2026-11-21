import { TEMPLATES, type TemplateType } from '@/config/templates'
import { cssFont, fontByKey, type NameFont } from '@/config/fonts'
import { coverCrop, type Crop } from '@/lib/crop'
import type { ExportPreset } from '@/config/exports'

export interface GenerateCardParams {
  name: string
  photo: File
  templateType?: TemplateType
  crop?: Crop
  fontKey?: string
  color?: string
  uppercase?: boolean
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

// The template is large (lossless PNG) — start fetching it as soon as the
// page opens so generation doesn't wait on the network.
const templateCache = new Map<string, Promise<HTMLImageElement>>()

export function preloadTemplate(templateType: TemplateType = 'membre'): Promise<HTMLImageElement> {
  const path = TEMPLATES[templateType].templatePath
  let pending = templateCache.get(path)
  if (!pending) {
    pending = loadImage(path)
    pending.catch(() => templateCache.delete(path))
    templateCache.set(path, pending)
  }
  return pending
}

// Draws the card at full template resolution; encode it with exportCard
export async function renderCard(params: GenerateCardParams): Promise<HTMLCanvasElement> {
  const config = TEMPLATES[params.templateType ?? 'membre']
  const font = fontByKey(params.fontKey ?? '')
  const color = params.color ?? '#0B2A5B'
  const name = params.uppercase ? params.name.toLocaleUpperCase('fr-FR') : params.name

  await ensureFont(font, name)

  // Templates are same-origin — crossOrigin='anonymous' is not needed and
  // causes iOS Safari to enforce CORS headers that Vercel doesn't send for static files.
  const templateImg = await preloadTemplate(params.templateType ?? 'membre')

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

  return canvas
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',')
  const type = head.match(/data:(.*?);/)?.[1] ?? 'image/png'
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type })
}

export async function exportCard(source: HTMLCanvasElement, preset: ExportPreset): Promise<Blob> {
  let canvas = source
  if (preset.size && preset.size !== source.width) {
    canvas = document.createElement('canvas')
    canvas.width = preset.size
    canvas.height = Math.round((source.height * preset.size) / source.width)
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  }

  const fallback = () => {
    try { return dataUrlToBlob(canvas.toDataURL(preset.type, preset.quality)) }
    catch { throw new Error('Export échoué — mémoire insuffisante') }
  }
  if (typeof canvas.toBlob !== 'function') return fallback()
  // toBlob is more memory-efficient; it returns null on OOM in some browsers
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) { resolve(blob); return }
        try { resolve(fallback()) } catch (e) { reject(e) }
      },
      preset.type,
      preset.quality
    )
  })
}
