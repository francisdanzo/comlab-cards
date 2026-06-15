'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Sparkles, ImageIcon } from 'lucide-react'
import { generateCard } from '@/lib/generateCard'
import s from './CardGenerator.module.css'

interface CardGeneratorProps {
  templateType: 'attendee' | 'speaker' | 'volunteer' | 'staff'
}

const TYPE_LABELS: Record<string, string> = {
  attendee: 'ATTENDEE',
  speaker: 'SPEAKER',
  volunteer: 'VOLUNTEER',
  staff: 'STAFF',
}

export default function CardGenerator({ templateType }: CardGeneratorProps) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = !!name.trim() && !!photo

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format non supporté — utilise JPG, PNG ou WEBP.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo trop lourde (max 10 MB).')
      return
    }
    setError(null)
    setPhoto(file)
    setPreviewUrl(null)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
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

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return
    setIsGenerating(true)
    setError(null)
    try {
      const url = await generateCard({ name: name.trim(), photo: photo!, templateType })
      setPreviewUrl(url)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erreur : ${err.message}`
          : 'Échec de la génération. Vérifie ta connexion et réessaie.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCard = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.download = `junetech-2026-${name.trim().toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = previewUrl
    link.click()
  }

  return (
    <div className={s.bg}>
      <div className={s.gridDot} />

      <div className={s.inner}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <img
              src="/logo/junetech_logo.png"
              alt="JuneTech"
              width={120}
              height={120}
              style={{
                borderRadius: '50%',
                boxShadow: '0 0 40px rgba(34,197,94,0.45), 0 0 80px rgba(34,197,94,0.15)',
                filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.5))',
              }}
            />
            <div>
              <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(26px, 5vw, 46px)',
                fontWeight: 900,
                color: '#22C55E',
                textShadow: '0 0 40px rgba(34,197,94,0.45)',
                margin: '0 0 8px',
                letterSpacing: '0.08em',
              }}>
                JUNETECH 2026
              </h1>
              <p style={{ color: '#4d7a57', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: 'Orbitron, sans-serif', margin: 0 }}>
                Générateur de Badge
              </p>
            </div>
          </div>
        </div>

        <div className={s.grid}>
          {/* Left — Form */}
          <div className={s.card}>
            <div className={s.cornerTL + ' ' + s.corner} />
            <div className={s.cornerTR + ' ' + s.corner} />
            <div className={s.cornerBL + ' ' + s.corner} />
            <div className={s.cornerBR + ' ' + s.corner} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', margin: 0 }}>
                TON BADGE
              </h2>
              <div className={s.badge}>
                <div className={s.dot} />
                {TYPE_LABELS[templateType]}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Name */}
              <div>
                <label className={s.label}>Nom complet</label>
                <input
                  className={s.input}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setPreviewUrl(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Prénom Nom"
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className={s.label}>Photo de profil</label>
                <div
                  className={`${s.uploadZone} ${isDragging ? s.uploadZoneDrag : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  {/* File input overlays the entire zone — works on all devices */}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={s.fileInput}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                  />

                  {photoPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        style={{
                          width: 96, height: 96, objectFit: 'cover', borderRadius: '50%',
                          border: '3px solid #22C55E',
                          boxShadow: '0 0 24px rgba(34,197,94,0.4)',
                        }}
                      />
                      <span style={{ fontSize: 13, color: '#4d7a57' }}>Cliquer pour changer</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, pointerEvents: 'none' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        border: '2px solid rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(34,197,94,0.06)',
                      }}>
                        <Upload size={28} color="#22C55E" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p style={{ color: '#d1fae5', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
                          Glisse ta photo ici
                        </p>
                        <p style={{ color: '#3d5e44', fontSize: 12, margin: 0 }}>
                          JPG, PNG, WEBP — max 10 MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && <div className={s.error}>{error}</div>}

              {/* Generate */}
              <button
                className={s.btnPrimary}
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
              >
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
                    Générer ma card
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right — Preview */}
          <div className={s.card} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={s.cornerTL + ' ' + s.corner} />
            <div className={s.cornerTR + ' ' + s.corner} />
            <div className={s.cornerBL + ' ' + s.corner} />
            <div className={s.cornerBR + ' ' + s.corner} />

            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', margin: '0 0 24px' }}>
              APERÇU
            </h2>

            <div className={s.previewSection}>
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Carte générée" className={s.previewImg} />
                  <button className={s.btnSecondary} onClick={downloadCard}>
                    <Download size={18} strokeWidth={2} />
                    Télécharger ma card
                  </button>
                </>
              ) : (
                <div className={s.emptyState}>
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%', margin: '0 auto 24px',
                    border: '2px dashed rgba(34,197,94,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(34,197,94,0.04)',
                  }}>
                    <ImageIcon size={44} color="rgba(34,197,94,0.25)" strokeWidth={1.5} />
                  </div>
                  <p style={{ color: '#2d5435', fontSize: 14, margin: 0 }}>
                    Ta card apparaîtra ici<br />après génération
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 40, color: '#1e3d26', fontSize: 12, letterSpacing: '0.18em', fontFamily: 'Orbitron, sans-serif' }}>
          JUNE TECH @ KIT-HUB — LE DIGITAL EST ABORDABLE
        </p>
      </div>
    </div>
  )
}
