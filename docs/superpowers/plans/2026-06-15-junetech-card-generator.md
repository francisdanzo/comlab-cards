# JuneTech Card Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 web app where JuneTech 2026 participants generate and download a personalized 1080×1080 PNG social card via three independent routes (/attendee, /speaker, /volunteer).

**Architecture:** Three routes each instantiate a shared `CardGenerator` component with their `templateType` prop. On form completion, `generateCard()` draws photo + template overlay + text on a browser Canvas and returns a data URL for preview and download. All processing is client-side — no backend, no env vars.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Canvas API (browser), sharp (placeholder PNG generation), Jest + React Testing Library

---

## File Map

| File | Responsibility |
|---|---|
| `scripts/generate-placeholders.ts` | Node script — generates 3 test PNG templates via SVG→sharp |
| `public/templates/attendee.png` | Placeholder template (replaced later by real asset) |
| `public/templates/speaker.png` | Placeholder template |
| `public/templates/volunteer.png` | Placeholder template |
| `src/config/domains.ts` | Domain dropdown list + exports `DOMAINS` constant |
| `src/config/templates.ts` | Per-template position/style config + exports `TEMPLATES` + types |
| `src/lib/generateCard.ts` | Canvas pipeline: crop, clip, overlay, text, returns dataURL |
| `src/components/CardGenerator.tsx` | Form (name, domain, photo upload) + auto-preview + download |
| `src/app/layout.tsx` | Root layout (minimal, sets metadata) |
| `src/app/page.tsx` | Root `/` — blank page |
| `src/app/attendee/page.tsx` | Mounts `<CardGenerator templateType="attendee" />` |
| `src/app/speaker/page.tsx` | Mounts `<CardGenerator templateType="speaker" />` |
| `src/app/volunteer/page.tsx` | Mounts `<CardGenerator templateType="volunteer" />` |
| `src/lib/__tests__/generateCard.test.ts` | Unit tests for `centerCropParams` and `wrapText` helpers |
| `src/components/__tests__/CardGenerator.test.tsx` | Component tests: form state, "Autre" toggle, file validation |

---

## Task 1: Scaffold Next.js 14 project

**Files:**
- Create: all Next.js boilerplate in `/`

- [ ] **Step 1: Run create-next-app in the existing directory**

```bash
cd /home/maverick/junetech-cards
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --yes
```

Expected: Next.js installs into the current directory. Files created: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `public/`.

- [ ] **Step 2: Remove default boilerplate content**

Edit `src/app/page.tsx` to be blank:

```tsx
export default function Home() {
  return null
}
```

Edit `src/app/globals.css` to keep only Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Delete `public/next.svg` and `public/vercel.svg` if they exist.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 with no errors. Visit `/` — blank page.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project"
```

---

## Task 2: Config files — domains and templates

**Files:**
- Create: `src/config/domains.ts`
- Create: `src/config/templates.ts`

- [ ] **Step 1: Create `src/config/domains.ts`**

```typescript
export const DOMAINS = [
  'Étudiant(e)',
  'Développeur / Développeuse',
  'Designer',
  'Entrepreneur(e)',
  'Chercheur / Chercheuse',
  'Ingénieur(e)',
  'Product Manager',
  'Data Scientist',
  'Journaliste / Médias',
  'Enseignant(e)',
  'Investisseur / Investisseuse',
  'Autre',
] as const
```

- [ ] **Step 2: Create `src/config/templates.ts`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/config/domains.ts src/config/templates.ts
git commit -m "feat: add template and domain config"
```

---

## Task 3: Generate placeholder PNG templates

**Files:**
- Create: `scripts/generate-placeholders.ts`
- Create: `public/templates/attendee.png`, `speaker.png`, `volunteer.png`

- [ ] **Step 1: Install sharp**

```bash
npm install --save-dev sharp @types/sharp tsx
```

Expected: Packages added to `devDependencies`. Sharp downloads a pre-compiled binary — no system deps needed.

- [ ] **Step 2: Create `scripts/generate-placeholders.ts`**

```typescript
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const SIZE = 1080
const PHOTO_CX = 290  // center X of photo zone (x:90 + width:400/2)
const PHOTO_CY = 290  // center Y
const PHOTO_R = 200   // radius (width:400/2)

const templates = [
  { name: 'attendee',  bg: '#1E3A5F', accent: '#3B82F6', label: 'ATTENDEE'  },
  { name: 'speaker',   bg: '#1A4731', accent: '#22C55E', label: 'SPEAKER'    },
  { name: 'volunteer', bg: '#7C2D12', accent: '#F97316', label: 'VOLUNTEER'  },
]

const outDir = path.resolve(process.cwd(), 'public/templates')
fs.mkdirSync(outDir, { recursive: true })

for (const tmpl of templates) {
  const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="${tmpl.bg}"/>

  <!-- Border -->
  <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}"
        fill="none" stroke="${tmpl.accent}" stroke-width="6"/>

  <!-- Photo zone circle outline -->
  <circle cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${PHOTO_R}"
          fill="${tmpl.accent}22" stroke="${tmpl.accent}" stroke-width="4"/>

  <!-- Photo label inside circle -->
  <text x="${PHOTO_CX}" y="${PHOTO_CY}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="36" font-weight="bold" fill="${tmpl.accent}">
    PHOTO
  </text>
  <text x="${PHOTO_CX}" y="${PHOTO_CY + 48}" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="20" fill="${tmpl.accent}99">
    zone placeholder
  </text>

  <!-- Type label -->
  <text x="${SIZE / 2}" y="570" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="80" font-weight="bold" fill="#FFFFFF">
    ${tmpl.label}
  </text>

  <!-- Accent underline -->
  <rect x="${SIZE / 2 - 100}" y="625" width="200" height="5" fill="${tmpl.accent}"/>

  <!-- Name zone placeholder -->
  <rect x="90" y="650" width="900" height="64" fill="${tmpl.accent}33" rx="8"/>
  <text x="${SIZE / 2}" y="682" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="26" fill="${tmpl.accent}">
    NOM — zone placeholder
  </text>

  <!-- Domain zone placeholder -->
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
```

- [ ] **Step 3: Run the script**

```bash
npx tsx scripts/generate-placeholders.ts
```

Expected output:
```
Generated: /home/maverick/junetech-cards/public/templates/attendee.png
Generated: /home/maverick/junetech-cards/public/templates/speaker.png
Generated: /home/maverick/junetech-cards/public/templates/volunteer.png
```

- [ ] **Step 4: Verify the PNGs were created**

```bash
ls -lh public/templates/
```

Expected: 3 PNG files, each around 50-150KB.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-placeholders.ts public/templates/ package.json package-lock.json
git commit -m "feat: add placeholder template PNGs and generation script"
```

---

## Task 4: Canvas helper functions + unit tests

**Files:**
- Create: `src/lib/generateCard.ts` (helpers only, no full function yet)
- Create: `src/lib/__tests__/generateCard.test.ts`

- [ ] **Step 1: Install Jest + React Testing Library**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 2: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default config
```

- [ ] **Step 3: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Write the failing tests**

Create `src/lib/__tests__/generateCard.test.ts`:

```typescript
import { centerCropParams, wrapText } from '@/lib/generateCard'

describe('centerCropParams', () => {
  it('returns full image when same aspect ratio', () => {
    const result = centerCropParams(400, 400, 400, 400)
    expect(result).toEqual({ sx: 0, sy: 0, sWidth: 400, sHeight: 400 })
  })

  it('crops width on wide image', () => {
    // 800×400 image cropped to 400×400 square
    const result = centerCropParams(800, 400, 400, 400)
    expect(result.sy).toBe(0)
    expect(result.sHeight).toBe(400)
    expect(result.sWidth).toBe(400)
    expect(result.sx).toBe(200) // (800 - 400) / 2
  })

  it('crops height on tall image', () => {
    // 400×800 image cropped to 400×400 square
    const result = centerCropParams(400, 800, 400, 400)
    expect(result.sx).toBe(0)
    expect(result.sWidth).toBe(400)
    expect(result.sHeight).toBe(400)
    expect(result.sy).toBe(200) // (800 - 400) / 2
  })
})

describe('wrapText', () => {
  // Mock measureText: returns width = text.length * 10
  const measureText = (text: string) => text.length * 10

  it('returns single line when text fits', () => {
    // "Hello World" = 11 chars * 10 = 110px, maxWidth 200
    expect(wrapText(measureText, 'Hello World', 200)).toEqual(['Hello World'])
  })

  it('wraps long text into multiple lines', () => {
    // Each word is ~5 chars * 10 = 50px; maxWidth 60 fits one word per line
    const lines = wrapText(measureText, 'Hello World Test', 60)
    expect(lines).toEqual(['Hello', 'World', 'Test'])
  })

  it('returns empty array for empty string', () => {
    expect(wrapText(measureText, '', 200)).toEqual([])
  })
})
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
npx jest src/lib/__tests__/generateCard.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '@/lib/generateCard'"

- [ ] **Step 6: Create `src/lib/generateCard.ts` with helper exports**

```typescript
export interface GenerateCardParams {
  name: string
  domain: string
  photo: File
  templateType: 'attendee' | 'speaker' | 'volunteer'
}

export function centerCropParams(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
  const sWidth = targetWidth / scale
  const sHeight = targetHeight / scale
  const sx = (imgWidth - sWidth) / 2
  const sy = (imgHeight - sHeight) / 2
  return { sx, sy, sWidth, sHeight }
}

export function wrapText(
  measureText: (text: string) => number,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (measureText(test) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function generateCard(_params: GenerateCardParams): Promise<string> {
  throw new Error('Not implemented yet')
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npx jest src/lib/__tests__/generateCard.test.ts --no-coverage
```

Expected: PASS — 5 tests passing.

- [ ] **Step 8: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "jest --no-coverage",
"test:watch": "jest --watch"
```

- [ ] **Step 9: Commit**

```bash
git add src/lib/generateCard.ts src/lib/__tests__/generateCard.test.ts jest.config.ts jest.setup.ts package.json package-lock.json
git commit -m "feat: add canvas helper functions with tests"
```

---

## Task 5: Complete generateCard pipeline

**Files:**
- Modify: `src/lib/generateCard.ts` (complete the `generateCard` function)

- [ ] **Step 1: Replace the stub `generateCard` with the full implementation**

Replace the entire content of `src/lib/generateCard.ts`:

```typescript
import { TEMPLATES } from '@/config/templates'

export interface GenerateCardParams {
  name: string
  domain: string
  photo: File
  templateType: 'attendee' | 'speaker' | 'volunteer'
}

export function centerCropParams(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
  const sWidth = targetWidth / scale
  const sHeight = targetHeight / scale
  const sx = (imgWidth - sWidth) / 2
  const sy = (imgHeight - sHeight) / 2
  return { sx, sy, sWidth, sHeight }
}

export function wrapText(
  measureText: (text: string) => number,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (measureText(test) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const { name, domain, photo, templateType } = params
  const config = TEMPLATES[templateType]

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  // Load and draw photo with center crop
  const photoUrl = URL.createObjectURL(photo)
  const photoImg = await loadImage(photoUrl)
  URL.revokeObjectURL(photoUrl)

  const { photoZone } = config
  const { sx, sy, sWidth, sHeight } = centerCropParams(
    photoImg.naturalWidth,
    photoImg.naturalHeight,
    photoZone.width,
    photoZone.height
  )

  ctx.save()
  if (photoZone.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(
      photoZone.x + photoZone.width / 2,
      photoZone.y + photoZone.height / 2,
      photoZone.width / 2,
      0,
      Math.PI * 2
    )
    ctx.clip()
  }
  ctx.drawImage(
    photoImg,
    sx, sy, sWidth, sHeight,
    photoZone.x, photoZone.y, photoZone.width, photoZone.height
  )
  ctx.restore()

  // Draw template overlay on top of photo
  const templateImg = await loadImage(config.templatePath)
  ctx.drawImage(templateImg, 0, 0, 1080, 1080)

  // Draw name with text wrap
  const nameConf = config.nameText
  ctx.font = `bold ${nameConf.fontSize}px ${nameConf.fontFamily}`
  ctx.fillStyle = nameConf.color
  ctx.textAlign = nameConf.align
  ctx.textBaseline = 'top'
  const nameLines = wrapText(
    (t) => ctx.measureText(t).width,
    name,
    nameConf.maxWidth
  )
  const lineHeight = nameConf.fontSize * 1.25
  nameLines.forEach((line, i) => {
    ctx.fillText(line, nameConf.x, nameConf.y + i * lineHeight)
  })

  // Draw domain
  const domConf = config.domainText
  ctx.font = `${domConf.fontSize}px ${domConf.fontFamily}`
  ctx.fillStyle = domConf.color
  ctx.textAlign = domConf.align
  ctx.textBaseline = 'top'
  ctx.fillText(domain, domConf.x, domConf.y)

  return canvas.toDataURL('image/png')
}
```

- [ ] **Step 2: Run existing tests to ensure helpers still pass**

```bash
npm test
```

Expected: PASS — 5 tests.

- [ ] **Step 3: Commit**

```bash
git add src/lib/generateCard.ts
git commit -m "feat: implement full canvas card generation pipeline"
```

---

## Task 6: CardGenerator component + tests

**Files:**
- Create: `src/components/CardGenerator.tsx`
- Create: `src/components/__tests__/CardGenerator.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/__tests__/CardGenerator.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CardGenerator from '@/components/CardGenerator'
import * as generateCardModule from '@/lib/generateCard'

jest.mock('@/lib/generateCard', () => ({
  ...jest.requireActual('@/lib/generateCard'),
  generateCard: jest.fn().mockResolvedValue('data:image/png;base64,abc'),
}))

const mockGenerateCard = generateCardModule.generateCard as jest.Mock

describe('CardGenerator', () => {
  beforeEach(() => {
    mockGenerateCard.mockClear()
  })

  it('renders form fields', () => {
    render(<CardGenerator templateType="attendee" />)
    expect(screen.getByPlaceholderText('Prénom Nom')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText(/clique ou glisse/i)).toBeInTheDocument()
  })

  it('shows custom domain input when "Autre" is selected', async () => {
    render(<CardGenerator templateType="attendee" />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Autre')
    expect(screen.getByPlaceholderText(/précise ton domaine/i)).toBeInTheDocument()
  })

  it('hides custom domain input for non-Autre domain', async () => {
    render(<CardGenerator templateType="attendee" />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Designer')
    expect(screen.queryByPlaceholderText(/précise ton domaine/i)).not.toBeInTheDocument()
  })

  it('does not call generateCard when fields are incomplete', () => {
    render(<CardGenerator templateType="attendee" />)
    // Only name filled — photo and domain still empty
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    expect(mockGenerateCard).not.toHaveBeenCalled()
  })

  it('rejects files larger than 10MB', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    render(<CardGenerator templateType="attendee" />)
    const bigFile = new File(['x'.repeat(11 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, bigFile)
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('10MB'))
    alertSpy.mockRestore()
  })

  it('shows download button only when preview is available', async () => {
    render(<CardGenerator templateType="speaker" />)
    expect(screen.queryByText(/télécharger/i)).not.toBeInTheDocument()

    // Simulate all fields filled
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Designer')
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/télécharger/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/components/__tests__/CardGenerator.test.tsx --no-coverage
```

Expected: FAIL — "Cannot find module '@/components/CardGenerator'"

- [ ] **Step 3: Create `src/components/CardGenerator.tsx`**

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { generateCard } from '@/lib/generateCard'
import { DOMAINS } from '@/config/domains'

interface CardGeneratorProps {
  templateType: 'attendee' | 'speaker' | 'volunteer'
}

export default function CardGenerator({ templateType }: CardGeneratorProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const effectiveDomain = domain === 'Autre' ? customDomain : domain

  useEffect(() => {
    if (!name || !effectiveDomain || !photo) return
    setIsGenerating(true)
    generateCard({ name, domain: effectiveDomain, photo, templateType })
      .then(setPreviewUrl)
      .finally(() => setIsGenerating(false))
  }, [name, effectiveDomain, photo, templateType])

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo trop lourde (max 10MB)')
      return
    }
    setPhoto(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const downloadCard = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.download = `junetech-2026-${name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = previewUrl
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">JUNETECH 2026</h1>
          <p className="text-gray-400 text-sm">Génère ta card JuneTech</p>
        </div>

        {/* Photo upload */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-950/20'
              : 'border-gray-700 hover:border-gray-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          {photo ? (
            <p className="text-sm text-green-400">{photo.name}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-300">Clique ou glisse ta photo</p>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP — max 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom Nom"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* Domain */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Domaine</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500"
          >
            <option value="">Sélectionne ton domaine</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {domain === 'Autre' && (
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="Précise ton domaine"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          )}
        </div>

        {/* Preview */}
        {(previewUrl || isGenerating) && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Prévisualisation</p>
            {isGenerating ? (
              <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
                <p className="text-gray-500 text-sm">Génération en cours…</p>
              </div>
            ) : (
              previewUrl && (
                <img
                  src={previewUrl}
                  alt="Prévisualisation de ta card"
                  className="w-full rounded-xl"
                />
              )
            )}
          </div>
        )}

        {/* Download */}
        {previewUrl && !isGenerating && (
          <button
            onClick={downloadCard}
            className="w-full bg-white text-gray-950 font-semibold rounded-xl py-4 hover:bg-gray-100 transition-colors"
          >
            ⬇ Télécharger ma card
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run component tests**

```bash
npx jest src/components/__tests__/CardGenerator.test.tsx --no-coverage
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: PASS — 11 tests total.

- [ ] **Step 6: Commit**

```bash
git add src/components/CardGenerator.tsx src/components/__tests__/CardGenerator.test.tsx
git commit -m "feat: add CardGenerator component with tests"
```

---

## Task 7: Route pages and layout

**Files:**
- Create: `src/app/attendee/page.tsx`
- Create: `src/app/speaker/page.tsx`
- Create: `src/app/volunteer/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/app/attendee/page.tsx`**

```tsx
import CardGenerator from '@/components/CardGenerator'

export default function AttendeePage() {
  return <CardGenerator templateType="attendee" />
}
```

- [ ] **Step 2: Create `src/app/speaker/page.tsx`**

```tsx
import CardGenerator from '@/components/CardGenerator'

export default function SpeakerPage() {
  return <CardGenerator templateType="speaker" />
}
```

- [ ] **Step 3: Create `src/app/volunteer/page.tsx`**

```tsx
import CardGenerator from '@/components/CardGenerator'

export default function VolunteerPage() {
  return <CardGenerator templateType="volunteer" />
}
```

- [ ] **Step 4: Update `src/app/page.tsx` (blank root)**

```tsx
export default function Home() {
  return null
}
```

- [ ] **Step 5: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JuneTech 2026 — Card Generator',
  description: 'Génère ta card JuneTech 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/attendee/page.tsx src/app/speaker/page.tsx src/app/volunteer/page.tsx src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add route pages for attendee, speaker, volunteer"
```

---

## Task 8: End-to-end manual verification

- [ ] **Step 1: Run all tests one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000, no compile errors.

- [ ] **Step 3: Test /attendee route**

Open http://localhost:3000/attendee in a browser. Verify:
- Page loads with dark background, JUNETECH 2026 header
- Upload zone visible, name input, domain dropdown
- Select a domain, enter a name, upload a photo → preview appears automatically
- "Télécharger ma card" button appears → click downloads a PNG named `junetech-2026-<name>.png`

- [ ] **Step 4: Test /speaker and /volunteer**

Open http://localhost:3000/speaker and http://localhost:3000/volunteer. Verify each loads independently and generates a card.

- [ ] **Step 5: Test "Autre" domain**

On any route: select "Autre" from the dropdown → custom text field appears. Fill it → card generates with the custom domain text.

- [ ] **Step 6: Test mobile behavior**

Open DevTools → toggle device toolbar → test on a 375px wide viewport. Verify:
- All form fields visible and usable
- Preview image scales correctly
- Download button accessible

- [ ] **Step 7: Test root / route**

Open http://localhost:3000 → blank page, no errors.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: verify e2e and finalize implementation"
```

---

## Deployment (after real templates are added)

When the real PNG templates are ready:
1. Replace `public/templates/attendee.png`, `speaker.png`, `volunteer.png` with the real assets
2. Update position/style values in `src/config/templates.ts` to match the real layouts
3. Push to GitHub → Vercel auto-deploys (no env vars needed)

```bash
git add public/templates/ src/config/templates.ts
git commit -m "feat: swap placeholder templates for production assets"
git push origin main
```
