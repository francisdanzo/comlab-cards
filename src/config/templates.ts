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
// Name pill usable zone: x=670–1750 (dark deco covers outside), center=(1210,1241), height=153
const SHARED_NAME_TEXT = {
  x: 1210, y: 1241, fontSize: 80,
  fontFamily: "'Montserrat', 'Arial Black', Arial, sans-serif", color: '#0D2547',
  align: 'center' as CanvasTextAlign, maxWidth: 880,
}
const SHARED_DOMAIN_TEXT = {
  x: 1210, y: 1241, fontSize: 45,
  fontFamily: "'Montserrat', Arial, sans-serif", color: '#4B5563',
  align: 'center' as CanvasTextAlign, maxWidth: 900,
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
