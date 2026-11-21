export interface NameFont {
  key: string
  label: string
  family: string
  weight: number
  style: 'normal' | 'italic'
  // Thin same-colour outline makes letters heavier; off for scripts
  stroke: boolean
}

// Selected to match the template's look (bold italic sans like "MEMBRE",
// techy display faces, plus rounded / script options echoing the logo).
// Every family here must also be listed in GOOGLE_FONTS_URL below.
export const NAME_FONTS: NameFont[] = [
  { key: 'montserrat-italic', label: 'ComLab',     family: 'Montserrat',        weight: 800, style: 'italic', stroke: true },
  { key: 'montserrat',        label: 'Moderne',    family: 'Montserrat',        weight: 800, style: 'normal', stroke: true },
  { key: 'poppins',           label: 'Poppins',    family: 'Poppins',           weight: 700, style: 'normal', stroke: true },
  { key: 'exo2',              label: 'Exo',        family: 'Exo 2',             weight: 800, style: 'italic', stroke: true },
  { key: 'rajdhani',          label: 'Rajdhani',   family: 'Rajdhani',          weight: 700, style: 'normal', stroke: true },
  { key: 'orbitron',          label: 'Tech',       family: 'Orbitron',          weight: 800, style: 'normal', stroke: true },
  { key: 'oswald',            label: 'Oswald',     family: 'Oswald',            weight: 600, style: 'normal', stroke: false },
  { key: 'bebas',             label: 'Bebas',      family: 'Bebas Neue',        weight: 400, style: 'normal', stroke: true },
  { key: 'comfortaa',         label: 'Arrondi',    family: 'Comfortaa',         weight: 700, style: 'normal', stroke: true },
  { key: 'playfair',          label: 'Élégant',    family: 'Playfair Display',  weight: 800, style: 'italic', stroke: false },
  { key: 'kaushan',           label: 'Signature',  family: 'Kaushan Script',    weight: 400, style: 'normal', stroke: false },
  { key: 'pacifico',          label: 'Manuscrit',  family: 'Pacifico',          weight: 400, style: 'normal', stroke: false },
]

export const DEFAULT_FONT_KEY = NAME_FONTS[0].key

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  [
    'family=Montserrat:ital,wght@0,500;0,700;0,800;1,800',
    'family=Poppins:wght@700',
    'family=Exo+2:ital,wght@1,800',
    'family=Rajdhani:wght@700',
    'family=Orbitron:wght@800',
    'family=Oswald:wght@600',
    'family=Bebas+Neue',
    'family=Comfortaa:wght@700',
    'family=Playfair+Display:ital,wght@1,800',
    'family=Kaushan+Script',
    'family=Pacifico',
  ].join('&') +
  '&display=swap'

export const NAME_COLORS = [
  { key: 'navy',  label: 'Bleu nuit', value: '#0B2A5B' },
  { key: 'blue',  label: 'Bleu ComLab', value: '#1E88E5' },
  { key: 'red',   label: 'Rouge',     value: '#D32F2F' },
  { key: 'black', label: 'Noir',      value: '#111111' },
] as const

export function fontByKey(key: string): NameFont {
  return NAME_FONTS.find((f) => f.key === key) ?? NAME_FONTS[0]
}

export function cssFont(font: NameFont, sizePx: number): string {
  return `${font.style} ${font.weight} ${sizePx}px '${font.family}', 'Arial Black', Arial, sans-serif`
}
