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

const SHARED_PHOTO_ZONE = { x: 1370, y: 518, width: 1776, height: 1776, shape: 'circle' as const }
const SHARED_NAME_TEXT = {
  x: 2240, y: 2483, fontSize: 130,
  fontFamily: 'Arial, sans-serif', color: '#0D2547',
  align: 'center' as CanvasTextAlign, maxWidth: 1700,
}
const SHARED_DOMAIN_TEXT = {
  x: 2240, y: 2600, fontSize: 90,
  fontFamily: 'Arial, sans-serif', color: '#4B5563',
  align: 'center' as CanvasTextAlign, maxWidth: 1600,
}

export const TEMPLATES: Record<'attendee' | 'speaker' | 'volunteer' | 'staff', TemplateConfig> = {
  attendee: {
    templatePath: '/templates/attendee.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  speaker: {
    templatePath: '/templates/speaker.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  volunteer: {
    templatePath: '/templates/volunteer.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
  staff: {
    templatePath: '/templates/staff.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: SHARED_PHOTO_ZONE,
    nameText: SHARED_NAME_TEXT,
    domainText: SHARED_DOMAIN_TEXT,
  },
}
