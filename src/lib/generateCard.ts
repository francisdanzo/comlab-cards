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

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const { name, photo, templateType } = params
  const config = TEMPLATES[templateType]
  const templateImg = await loadImage(config.templatePath, true)

  const canvas = document.createElement('canvas')
  canvas.width = config.canvasSize.width
  canvas.height = config.canvasSize.height
  const ctx = canvas.getContext('2d')!

  // Draw template first — it is fully opaque (no transparency in photo zone)
  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

  // Draw photo on top of the template, clipped to the photo zone shape
  const photoUrl = URL.createObjectURL(photo)
  const photoImg = await loadImage(photoUrl)
  URL.revokeObjectURL(photoUrl)

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
  ctx.drawImage(
    photoImg,
    sx, sy, sWidth, sHeight,
    photoZone.x, photoZone.y, photoZone.width, photoZone.height
  )
  ctx.restore()

  const nameConf = config.nameText
  ctx.font = `bold ${nameConf.fontSize}px ${nameConf.fontFamily}`
  ctx.fillStyle = nameConf.color
  ctx.textAlign = nameConf.align
  ctx.textBaseline = 'top'
  const nameLines = wrapText(
    (t) => ctx.measureText(t).width,
    name,
    nameConf.maxWidth
  )
  const lineHeight = nameConf.fontSize * 1.2
  // nameConf.y is the band center — vertically center the text block around it
  const totalHeight = nameLines.length * lineHeight
  const startY = nameConf.y - totalHeight / 2
  nameLines.forEach((line, i) => {
    ctx.fillText(line, nameConf.x, startY + i * lineHeight)
  })

  return canvas.toDataURL('image/png')
}
