export interface ExportPreset {
  key: string
  label: string
  description: string
  type: 'image/png' | 'image/jpeg'
  // JPEG quality, ignored for PNG
  quality?: number
  // Output side in px; omitted = full template resolution
  size?: number
}

// Listed from best quality to lightest
export const EXPORT_PRESETS: ExportPreset[] = [
  {
    key: 'png',
    label: 'PNG Qualité maximale',
    description: 'Sans aucune perte — impression, retouche',
    type: 'image/png',
  },
  {
    key: 'jpeg-hd',
    label: 'JPEG Haute qualité',
    description: 'Quasi sans perte, plus léger que le PNG',
    type: 'image/jpeg',
    quality: 0.95,
  },
  {
    key: 'jpeg',
    label: 'JPEG Standard',
    description: 'Bon compromis pour les réseaux sociaux',
    type: 'image/jpeg',
    quality: 0.85,
  },
  {
    key: 'jpeg-light',
    label: 'JPEG Léger',
    description: 'Envoi rapide (WhatsApp, Messenger)',
    type: 'image/jpeg',
    quality: 0.85,
    size: 1080,
  },
]

export const DEFAULT_EXPORT_KEY = 'png'

// Encoded first (fast, near-lossless) and shown as the on-screen preview
export const PREVIEW_EXPORT_KEY = 'jpeg-hd'

export function encodeOrder(): ExportPreset[] {
  return [...EXPORT_PRESETS].sort((a, b) => Number(b.key === PREVIEW_EXPORT_KEY) - Number(a.key === PREVIEW_EXPORT_KEY))
}

export function presetByKey(key: string): ExportPreset {
  return EXPORT_PRESETS.find((p) => p.key === key) ?? EXPORT_PRESETS[0]
}

export function extensionOf(preset: ExportPreset): string {
  return preset.type === 'image/png' ? 'png' : 'jpg'
}

export function formatBytes(bytes: number): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${fmt(Math.round(bytes / 1024))} Ko`
  return `${fmt(bytes / (1024 * 1024))} Mo`
}
