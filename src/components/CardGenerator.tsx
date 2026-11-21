'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Sparkles, ImageIcon, RefreshCw, Expand } from 'lucide-react'
import { exportCard, preloadTemplate, renderCard } from '@/lib/generateCard'
import { coverCrop, type Crop } from '@/lib/crop'
import { DEFAULT_FONT_KEY, NAME_COLORS, NAME_FONTS } from '@/config/fonts'
import { TEMPLATES, type TemplateType } from '@/config/templates'
import { PREVIEW_EXPORT_KEY, encodeOrder, extensionOf, presetByKey } from '@/config/exports'
import PhotoCropper from './PhotoCropper'
import CardResultModal from './CardResultModal'
import s from './CardGenerator.module.css'

interface CardGeneratorProps {
  templateType?: TemplateType
}

interface ExportedFile {
  blob: Blob
  url: string
}

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml'

export default function CardGenerator({ templateType = 'membre' }: CardGeneratorProps) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null)
  const [crop, setCrop] = useState<Crop | null>(null)
  const [fontKey, setFontKey] = useState(DEFAULT_FONT_KEY)
  const [color, setColor] = useState<string>(NAME_COLORS[0].value)
  const [uppercase, setUppercase] = useState(false)
  const [card, setCard] = useState<HTMLCanvasElement | null>(null)
  const [exports, setExports] = useState<Record<string, ExportedFile>>({})
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = !!name.trim() && !!photo
  const photoBlobRef = useRef<string | null>(null)
  const exportsRef = useRef<Record<string, ExportedFile>>({})
  // Bumped on every edit so encodes from a stale card are dropped
  const generationRef = useRef(0)

  const revokeExports = () => {
    Object.values(exportsRef.current).forEach((f) => URL.revokeObjectURL(f.url))
    exportsRef.current = {}
  }

  useEffect(() => {
    preloadTemplate(templateType).catch(() => { /* retried on generate */ })
    return () => {
      revokeExports()
      if (photoBlobRef.current) URL.revokeObjectURL(photoBlobRef.current)
    }
  }, [templateType])

  // Any edit invalidates the generated card
  const invalidate = () => {
    generationRef.current++
    revokeExports()
    setExports({})
    setCard(null)
  }

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Format non supporté — utilise une image (JPG, PNG, WEBP…).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop lourde (max 10 MB).')
      return
    }
    setError(null)
    setPhoto(file)
    invalidate()
    setImageSize(null)
    setCrop(null)
    if (photoBlobRef.current) URL.revokeObjectURL(photoBlobRef.current)
    const url = URL.createObjectURL(file)
    photoBlobRef.current = url
    setPhotoPreview(url)

    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || 1
      const h = img.naturalHeight || 1
      setImageSize({ w, h })
      setCrop(coverCrop(w, h))
    }
    img.src = url
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

  const handleCropChange = (next: Crop) => {
    setCrop(next)
    invalidate()
  }

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return
    invalidate()
    const generation = generationRef.current
    setIsGenerating(true)
    setIsResultOpen(true)
    setError(null)
    try {
      const canvas = await renderCard({
        name: name.trim(),
        photo: photo!,
        templateType,
        crop: crop ?? undefined,
        fontKey,
        color,
        uppercase,
      })
      if (generation !== generationRef.current) return
      setCard(canvas)

      // Encode every preset one after another so each option shows its real size.
      // The preview preset goes first so the card shows up quickly.
      for (const preset of encodeOrder()) {
        const blob = await exportCard(canvas, preset)
        if (generation !== generationRef.current) return
        const file = { blob, url: URL.createObjectURL(blob) }
        exportsRef.current = { ...exportsRef.current, [preset.key]: file }
        setExports(exportsRef.current)
        setIsGenerating(false)
      }
    } catch (err) {
      setIsResultOpen(false)
      setError(
        err instanceof Error
          ? `Erreur : ${err.message}`
          : 'Échec de la génération. Vérifie ta connexion et réessaie.'
      )
    } finally {
      if (generation === generationRef.current) setIsGenerating(false)
    }
  }

  const previewUrl = exports[PREVIEW_EXPORT_KEY]?.url ?? null

  const downloadCard = (presetKey: string) => {
    const preset = presetByKey(presetKey)
    const file = exports[preset.key]
    if (!file) return
    const slug = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    const link = document.createElement('a')
    link.download = `comlab-membre-${slug || 'card'}-${preset.key}.${extensionOf(preset)}`
    link.href = file.url
    link.click()
  }

  // Source pixels per output pixel in the photo circle; below ~0.6 it looks soft
  const lowRes = !!crop && crop.size / TEMPLATES[templateType].photoZone.size < 0.6

  const fileInput = (
    <input
      type="file"
      accept={ACCEPTED_TYPES}
      className={s.fileInput}
      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
    />
  )

  const sample = name.trim() || 'ComLab'

  return (
    <div className={s.bg}>
      <div className={s.inner}>
        <header className={s.header}>
          <div className={s.logoPlate}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/comlab__logo.png" alt="ComLab — Community Laboratory" className={s.logo} />
          </div>
          <h1 className={s.title}>
            Je suis membre de <span className={s.titleAccent}>ComLab</span>
          </h1>
          <p className={s.subtitle}>
            Crée ton visuel de membre en 30 secondes et partage-le sur tes réseaux.
          </p>
          <div className={s.redBar} />
        </header>

        <div className={s.grid}>
          {/* Left — Form */}
          <section className={s.card}>
            <h2 className={s.cardTitle}>Ton visuel</h2>

            <div className={s.stack}>
              {/* Name */}
              <div>
                <label className={s.label} htmlFor="name">Nom complet</label>
                <input
                  id="name"
                  className={s.input}
                  type="text"
                  value={name}
                  maxLength={48}
                  onChange={(e) => { setName(e.target.value); invalidate() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Prénom Nom"
                  autoComplete="name"
                />
              </div>

              {/* Photo / logo */}
              <div>
                <span className={s.label}>Photo ou logo</span>
                {photoPreview && imageSize && crop ? (
                  <>
                    <PhotoCropper src={photoPreview} imageSize={imageSize} crop={crop} onChange={handleCropChange} />
                    {lowRes && (
                      <p className={s.warning}>
                        Image en basse résolution pour ce cadrage : le rendu risque d&apos;être flou.
                        Dézoome un peu ou choisis une image plus grande.
                      </p>
                    )}
                    <label className={s.changeBtn}>
                      {fileInput}
                      <RefreshCw size={14} /> Changer d&apos;image
                    </label>
                  </>
                ) : (
                  <div
                    className={`${s.uploadZone} ${isDragging ? s.uploadZoneDrag : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    {fileInput}
                    <div className={s.uploadInner}>
                      <div className={s.uploadIcon}>
                        <Upload size={26} strokeWidth={1.75} />
                      </div>
                      <p className={s.uploadText}>Glisse ta photo ou ton logo ici</p>
                      <p className={s.uploadSub}>JPG, PNG, WEBP, SVG — max 10 MB · tu pourras recadrer ensuite</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Font */}
              <div>
                <span className={s.label}>Police du nom</span>
                <div className={s.fontGrid} role="radiogroup" aria-label="Police du nom">
                  {NAME_FONTS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      role="radio"
                      aria-checked={fontKey === f.key}
                      className={`${s.fontBtn} ${fontKey === f.key ? s.fontBtnActive : ''}`}
                      onClick={() => { setFontKey(f.key); invalidate() }}
                    >
                      <span
                        className={s.fontSample}
                        style={{ fontFamily: `'${f.family}', sans-serif`, fontWeight: f.weight, fontStyle: f.style }}
                      >
                        {uppercase ? sample.toLocaleUpperCase('fr-FR') : sample}
                      </span>
                      <span className={s.fontName}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color + case */}
              <div className={s.optionsRow}>
                <div>
                  <span className={s.label}>Couleur</span>
                  <div className={s.swatches} role="radiogroup" aria-label="Couleur du nom">
                    {NAME_COLORS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        role="radio"
                        aria-checked={color === c.value}
                        aria-label={c.label}
                        title={c.label}
                        className={`${s.swatch} ${color === c.value ? s.swatchActive : ''}`}
                        style={{ background: c.value }}
                        onClick={() => { setColor(c.value); invalidate() }}
                      />
                    ))}
                  </div>
                </div>
                <label className={s.toggle}>
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => { setUppercase(e.target.checked); invalidate() }}
                  />
                  <span>MAJUSCULES</span>
                </label>
              </div>

              {error && <div className={s.error} role="alert">{error}</div>}

              <button className={s.btnPrimary} onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
                {isGenerating ? (
                  <>
                    <svg className={s.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Génération…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} strokeWidth={2} />
                    Générer mon visuel
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Right — Preview */}
          <section className={`${s.card} ${s.previewCard}`}>
            <h2 className={s.cardTitle}>Aperçu</h2>

            <div className={s.previewSection}>
              {previewUrl && card ? (
                <>
                  <button type="button" className={s.previewOpen} onClick={() => setIsResultOpen(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Visuel généré" className={s.previewImg} />
                  </button>
                  <button type="button" className={s.btnGhost} onClick={() => setIsResultOpen(true)}>
                    <Expand size={16} /> Ouvrir et télécharger
                  </button>
                </>
              ) : (
                <div className={s.emptyState}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/membre-preview.webp" alt="" className={s.templateGhost} />
                  <p className={s.emptyText}>
                    <ImageIcon size={16} /> Ton visuel apparaîtra ici après génération
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <CardResultModal
          open={isResultOpen}
          previewUrl={previewUrl}
          cardSize={card?.width ?? null}
          exports={exports}
          onDownload={downloadCard}
          onClose={() => setIsResultOpen(false)}
        />

        <footer className={s.footer}>
          ComLab · Community Laboratory — Connecter · Collaborer · Apprendre · Saisir des opportunités
        </footer>
      </div>
    </div>
  )
}
