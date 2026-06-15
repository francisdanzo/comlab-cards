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

export const TEMPLATES: Record<'attendee' | 'speaker' | 'volunteer' | 'staff', TemplateConfig> = {
  attendee: {
    templatePath: '/templates/attendee.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: { x: 1320, y: 520, width: 1830, height: 1830, shape: 'circle' },
    nameText: {
      x: 2670, y: 2391, fontSize: 190,
      fontFamily: 'Arial, sans-serif', color: '#0D2547',
      align: 'center', maxWidth: 1680,
    },
    domainText: {
      x: 2048, y: 2905, fontSize: 98,
      fontFamily: 'Arial, sans-serif', color: '#4B5563',
      align: 'center', maxWidth: 1580,
    },
  },
  speaker: {
    templatePath: '/templates/speaker.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: { x: 1320, y: 520, width: 1830, height: 1830, shape: 'circle' },
    nameText: {
      x: 2670, y: 2391, fontSize: 190,
      fontFamily: 'Arial, sans-serif', color: '#0D2547',
      align: 'center', maxWidth: 1680,
    },
    domainText: {
      x: 2048, y: 2905, fontSize: 98,
      fontFamily: 'Arial, sans-serif', color: '#4B5563',
      align: 'center', maxWidth: 1580,
    },
  },
  volunteer: {
    templatePath: '/templates/volunteer.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: { x: 1320, y: 520, width: 1830, height: 1830, shape: 'circle' },
    nameText: {
      x: 2670, y: 2391, fontSize: 190,
      fontFamily: 'Arial, sans-serif', color: '#0D2547',
      align: 'center', maxWidth: 1680,
    },
    domainText: {
      x: 2048, y: 2905, fontSize: 98,
      fontFamily: 'Arial, sans-serif', color: '#4B5563',
      align: 'center', maxWidth: 1580,
    },
  },
  staff: {
    templatePath: '/templates/staff.png',
    canvasSize: { width: 4096, height: 4096 },
    photoZone: { x: 1320, y: 520, width: 1830, height: 1830, shape: 'circle' },
    nameText: {
      x: 2670, y: 2391, fontSize: 190,
      fontFamily: 'Arial, sans-serif', color: '#0D2547',
      align: 'center', maxWidth: 1680,
    },
    domainText: {
      x: 2048, y: 2905, fontSize: 98,
      fontFamily: 'Arial, sans-serif', color: '#4B5563',
      align: 'center', maxWidth: 1580,
    },
  },
}
