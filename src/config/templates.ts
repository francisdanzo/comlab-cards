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

// All coordinates are in 2048×2048 space (templates resized from 4096 with ×0.5 scale)
const SHARED_PHOTO_ZONE = { x: 685, y: 259, width: 888, height: 888, shape: 'circle' as const }
const SHARED_NAME_TEXT = {
  x: 1120, y: 1241, fontSize: 65,
  fontFamily: 'Arial, sans-serif', color: '#0D2547',
  align: 'center' as CanvasTextAlign, maxWidth: 850,
}
const SHARED_DOMAIN_TEXT = {
  x: 1120, y: 1300, fontSize: 45,
  fontFamily: 'Arial, sans-serif', color: '#4B5563',
  align: 'center' as CanvasTextAlign, maxWidth: 800,
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
