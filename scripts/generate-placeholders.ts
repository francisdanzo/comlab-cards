import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const SIZE = 1080
const PHOTO_CX = 290
const PHOTO_CY = 290
const PHOTO_R = 200

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
  <rect width="${SIZE}" height="${SIZE}" fill="${tmpl.bg}"/>
  <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}"
        fill="none" stroke="${tmpl.accent}" stroke-width="6"/>
  <circle cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${PHOTO_R}"
          fill="${tmpl.accent}22" stroke="${tmpl.accent}" stroke-width="4"/>
  <text x="${PHOTO_CX}" y="${PHOTO_CY}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="36" font-weight="bold" fill="${tmpl.accent}">
    PHOTO
  </text>
  <text x="${PHOTO_CX}" y="${PHOTO_CY + 48}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="20" fill="${tmpl.accent}99">
    zone placeholder
  </text>
  <text x="${SIZE / 2}" y="570" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="80" font-weight="bold" fill="#FFFFFF">
    ${tmpl.label}
  </text>
  <rect x="${SIZE / 2 - 100}" y="625" width="200" height="5" fill="${tmpl.accent}"/>
  <rect x="90" y="650" width="900" height="64" fill="${tmpl.accent}33" rx="8"/>
  <text x="${SIZE / 2}" y="682" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="26" fill="${tmpl.accent}">
    NOM — zone placeholder
  </text>
  <rect x="90" y="730" width="900" height="44" fill="${tmpl.accent}1A" rx="8"/>
  <text x="${SIZE / 2}" y="752" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="22" fill="${tmpl.accent}CC">
    DOMAINE — zone placeholder
  </text>
</svg>`

  const outPath = path.join(outDir, `${tmpl.name}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`Generated: ${outPath}`)
}
})()
