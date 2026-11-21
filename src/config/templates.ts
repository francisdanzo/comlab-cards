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
  // Blue banner where the member's role is written (word erased from the template)
  roleText: {
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
    // membre-base.png = membre.png with "MEMBRE" erased (scripts/make-template-base.cjs)
    templatePath: '/templates/membre-base.png',
    canvasSize: { width: 2508, height: 2508 },
    photoZone: { x: 1585 - 515, y: 845 - 515, size: 1030, background: '#FFFFFF' },
    nameText: {
      x: 1577, y: 1460,
      fontSize: 104, minFontSize: 56,
      maxWidth: 1130, bandHeight: 140,
    },
    // Erased box x=1170–1970, y=1608–1740; original word cap height ≈103px
    roleText: {
      x: 1570, y: 1674,
      fontSize: 140, minFontSize: 52,
      maxWidth: 780, bandHeight: 128,
    },
  },
}
