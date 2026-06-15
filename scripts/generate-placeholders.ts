import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const SIZE = 1080
const PHOTO_CX = 290
const PHOTO_CY = 290
const PHOTO_R = 200
// These match templates.ts nameText.y and the dynamic domain offset
const NAME_Y = 560
const DOMAIN_Y = 641 // NAME_Y + 1 line (65px) + 16px padding

const templates = [
  { name: 'attendee',  bg: '#1E3A5F', accent: '#3B82F6', label: 'ATTENDEE'  },
  { name: 'speaker',   bg: '#1A4731', accent: '#22C55E', label: 'SPEAKER'    },
  { name: 'volunteer', bg: '#7C2D12', accent: '#F97316', label: 'VOLUNTEER'  },
]

const outDir = path.resolve(process.cwd(), 'public/templates')
fs.mkdirSync(outDir, { recursive: true })

void (async () => {
for (const tmpl of templates) {
  const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Mask cuts a transparent hole in the background for the photo zone -->
    <mask id="bg-mask">
      <rect width="${SIZE}" height="${SIZE}" fill="white"/>
      <circle cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${PHOTO_R}" fill="black"/>
    </mask>
  </defs>

  <!-- Background with transparent hole for photo -->
  <rect width="${SIZE}" height="${SIZE}" fill="${tmpl.bg}" mask="url(#bg-mask)"/>

  <!-- Border -->
  <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}"
        fill="none" stroke="${tmpl.accent}" stroke-width="6"/>

  <!-- Photo zone circle outline (shows over photo) -->
  <circle cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${PHOTO_R}"
          fill="none" stroke="${tmpl.accent}" stroke-width="4"/>

  <!-- Photo label (shown when no photo yet — covered when photo drawn) -->
  <text x="${PHOTO_CX}" y="${PHOTO_CY - 20}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="36" font-weight="bold" fill="${tmpl.accent}">
    PHOTO
  </text>
  <text x="${PHOTO_CX}" y="${PHOTO_CY + 28}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="20" fill="${tmpl.accent}99">
    zone placeholder
  </text>

  <!-- Type label -->
  <text x="${SIZE / 2}" y="515" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="64" font-weight="bold" fill="#FFFFFF">
    ${tmpl.label}
  </text>

  <!-- Name zone (matches templates.ts nameText.y=560) -->
  <rect x="90" y="${NAME_Y}" width="900" height="65" fill="${tmpl.accent}33" rx="6"/>
  <text x="${SIZE / 2}" y="${NAME_Y + 32}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="22" fill="${tmpl.accent}">
    NOM
  </text>

  <!-- Domain zone (matches dynamic domain y = name_y + lineHeight + padding) -->
  <rect x="90" y="${DOMAIN_Y}" width="900" height="44" fill="${tmpl.accent}1A" rx="6"/>
  <text x="${SIZE / 2}" y="${DOMAIN_Y + 22}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="18" fill="${tmpl.accent}CC">
    DOMAINE
  </text>

  <!-- Accent line -->
  <rect x="${SIZE / 2 - 60}" y="${NAME_Y - 12}" width="120" height="3" fill="${tmpl.accent}"/>
</svg>`

  const outPath = path.join(outDir, `${tmpl.name}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`Generated: ${outPath}`)
}
})()
