import { TEMPLATES } from '@/config/templates'

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const { name, domain, photo, templateType } = params
  const config = TEMPLATES[templateType]

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

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

  const templateImg = await loadImage(config.templatePath)
  ctx.drawImage(templateImg, 0, 0, 1080, 1080)

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
  const lineHeight = nameConf.fontSize * 1.25
  nameLines.forEach((line, i) => {
    ctx.fillText(line, nameConf.x, nameConf.y + i * lineHeight)
  })

  const domConf = config.domainText
  ctx.font = `${domConf.fontSize}px ${domConf.fontFamily}`
  ctx.fillStyle = domConf.color
  ctx.textAlign = domConf.align
  ctx.textBaseline = 'top'
  ctx.fillText(domain, domConf.x, domConf.y)

  return canvas.toDataURL('image/png')
}
