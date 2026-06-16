export interface TemplateConfig {
  templatePath: string
  canvasSize: {
    width: number
    height: number
  }
  photoZone: {
    x: number
    y: number
    width: number
    height: number
    shape: 'circle' | 'rectangle'
  }
  nameText: {
    x: number
    y: number
    fontSize: number
    fontFamily: string
    color: string
    align: CanvasTextAlign
    maxWidth: number
  }
  domainText: {
    x: number
    y: number
    fontSize: number
    fontFamily: string
    color: string
    align: CanvasTextAlign
    maxWidth: number
  }
}

// All coordinates are in 2048×2048 space (pixel-scanned from resized templates)
const SHARED_PHOTO_ZONE = { x: 685, y: 259, width: 888, height: 888, shape: 'circle' as const }
// Name pill: x=667–2002, center=(1335,1209), height=218
const SHARED_NAME_TEXT = {
  x: 1335, y: 1209, fontSize: 82,
  fontFamily: "'Montserrat', 'Arial Black', Arial, sans-serif", color: '#0D2547',
  align: 'center' as CanvasTextAlign, maxWidth: 1200,
}
const SHARED_DOMAIN_TEXT = {
  x: 1335, y: 1300, fontSize: 45,
  fontFamily: "'Montserrat', Arial, sans-serif", color: '#4B5563',
  align: 'center' as CanvasTextAlign, maxWidth: 1100,
}

export const TEMPLATES: Record<'attendee' | 'speaker' | 'volunteer' | 'staff', TemplateConfig> = {
  attendee: {
    templatePath: '/templates/attendee.png',
    canvasSize: { width: 2048, height: 2048 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  speaker: {
    templatePath: '/templates/speaker.png',
    canvasSize: { width: 2048, height: 2048 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  volunteer: {
    templatePath: '/templates/volunteer.png',
    canvasSize: { width: 2048, height: 2048 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  staff: {
    templatePath: '/templates/staff.png',
    canvasSize: { width: 2048, height: 2048 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
}
