export interface TemplateConfig {
  templatePath: string
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

export const TEMPLATES: Record<'attendee' | 'speaker' | 'volunteer', TemplateConfig> = {
  attendee: {
    templatePath: '/templates/attendee.png',
    photoZone: { x: 90, y: 90, width: 400, height: 400, shape: 'circle' },
    nameText: {
      x: 540, y: 560, fontSize: 52,
      fontFamily: 'Inter, sans-serif', color: '#FFFFFF',
      align: 'center', maxWidth: 900,
    },
    domainText: {
      x: 540, y: 640, fontSize: 32,
      fontFamily: 'Inter, sans-serif', color: '#E0E0E0',
      align: 'center', maxWidth: 900,
    },
  },
  speaker: {
    templatePath: '/templates/speaker.png',
    photoZone: { x: 90, y: 90, width: 400, height: 400, shape: 'circle' },
    nameText: {
      x: 540, y: 560, fontSize: 52,
      fontFamily: 'Inter, sans-serif', color: '#FFFFFF',
      align: 'center', maxWidth: 900,
    },
    domainText: {
      x: 540, y: 640, fontSize: 32,
      fontFamily: 'Inter, sans-serif', color: '#E0E0E0',
      align: 'center', maxWidth: 900,
    },
  },
  volunteer: {
    templatePath: '/templates/volunteer.png',
    photoZone: { x: 90, y: 90, width: 400, height: 400, shape: 'circle' },
    nameText: {
      x: 540, y: 560, fontSize: 52,
      fontFamily: 'Inter, sans-serif', color: '#FFFFFF',
      align: 'center', maxWidth: 900,
    },
    domainText: {
      x: 540, y: 640, fontSize: 32,
      fontFamily: 'Inter, sans-serif', color: '#E0E0E0',
      align: 'center', maxWidth: 900,
    },
  },
}
