export interface TemplateConfig {
  templatePath: string
  canvasSize: {
    width: number
    height: number
  }
  // Circle the user's photo/logo is drawn into (bounding square)
  photoZone: {
    x: number
    y: number
    size: number
    background: string
  }
  // White pill under the photo where the name is written
  nameText: {
    x: number
    y: number
    fontSize: number
    minFontSize: number
    maxWidth: number
    bandHeight: number
  }
}

// All coordinates are in 2508×2508 space (pixel-scanned from membre.png)
// Photo circle: white ring spans x=1036–2134, y=307–1381 → center (1585,845).
// r=515 keeps the outer white ring visible around the photo.
// Name pill: white x≈912–2212, y≈1382–1580 → center (1565,1481).
export type TemplateType = 'membre'

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  membre: {
    templatePath: '/templates/membre.jpg',
    canvasSize: { width: 2508, height: 2508 },
    photoZone: { x: 1585 - 515, y: 845 - 515, size: 1030, background: '#FFFFFF' },
    nameText: {
      x: 1565, y: 1483,
      fontSize: 112, minFontSize: 60,
      maxWidth: 1120, bandHeight: 160,
    },
  },
}
