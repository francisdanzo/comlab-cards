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
// Name pill: white x≈927–2227, y≈1377–1543 → center (1577,1460).
export type TemplateType = 'membre'

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  membre: {
    templatePath: '/templates/membre.png',
    canvasSize: { width: 2508, height: 2508 },
    photoZone: { x: 1585 - 515, y: 845 - 515, size: 1030, background: '#FFFFFF' },
    nameText: {
      x: 1577, y: 1460,
      fontSize: 104, minFontSize: 56,
      maxWidth: 1130, bandHeight: 140,
    },
  },
}
