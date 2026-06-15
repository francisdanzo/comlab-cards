'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Sparkles, ImageIcon } from 'lucide-react'
import { generateCard } from '@/lib/generateCard'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canGenerate = !!name.trim() && !!photo

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo trop lourde (max 10MB)')
      return
    }
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
    try {
      const url = await generateCard({ name: name.trim(), photo: photo!, templateType })
      setPreviewUrl(url)
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap');

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.10); }
          50%       { box-shadow: 0 0 35px rgba(34,197,94,0.45), 0 0 80px rgba(34,197,94,0.20); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .jt-bg {
          background: radial-gradient(ellipse at 20% 20%, #0d2010 0%, #000 55%, #0a1a0d 100%);
          background-size: 200% 200%;
          animation: gradient-shift 18s ease infinite;
        }
        .jt-card {
          background: rgba(5, 12, 7, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 20px;
          animation: glow-pulse 4s ease-in-out infinite;
        }
        .jt-input {
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 10px;
          color: #fff;
          width: 100%;
          padding: 14px 18px;
          font-size: 16px;
          font-family: 'Exo 2', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .jt-input:focus {
          border-color: #22C55E;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
        }
        .jt-input::placeholder { color: #3d5e44; }
        .jt-btn-primary {
          width: 100%;
          padding: 16px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #22C55E 0%, #16a34a 100%);
          color: #000;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .jt-btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 0 32px rgba(34,197,94,0.55);
          transform: translateY(-1px);
        }
        .jt-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .jt-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
        .jt-btn-secondary {
          width: 100%;
          padding: 16px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          background: transparent;
          color: #22C55E;
          border: 2px solid #22C55E;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .jt-btn-secondary:hover {
          background: rgba(34,197,94,0.10);
          box-shadow: 0 0 24px rgba(34,197,94,0.35);
          transform: translateY(-1px);
        }
        .jt-upload-zone {
          border: 2px dashed rgba(34,197,94,0.30);
          border-radius: 14px;
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: rgba(0,0,0,0.30);
        }
        .jt-upload-zone:hover, .jt-upload-zone.drag {
          border-color: #22C55E;
          background: rgba(34,197,94,0.07);
        }
        .jt-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #22C55E;
          display: block;
          margin-bottom: 10px;
        }
        .jt-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border: 1px solid rgba(34,197,94,0.4);
          border-radius: 999px;
          background: rgba(34,197,94,0.08);
          color: #22C55E;
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }
        .jt-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }
        .jt-grid-dot {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .jt-corner {
          position: absolute; width: 18px; height: 18px;
          border-color: #22C55E; border-style: solid; opacity: 0.6;
        }
        .jt-corner-tl { top: 0; left: 0; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
        .jt-corner-tr { top: 0; right: 0; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
        .jt-corner-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
        .jt-corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }
      `}</style>

      <div className="jt-bg" style={{ minHeight: '100dvh', color: '#fff', fontFamily: "'Exo 2', sans-serif" }}>
        {/* Grid dot pattern */}
        <div className="jt-grid-dot" style={{ position: 'fixed' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 20px 60px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* Real JuneTech logo */}
              <img
                src="/logo/junetech_logo.png"
                alt="JuneTech logo"
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
                  lineHeight: 1,
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

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>

            {/* Left: Form */}
            <div className="jt-card" style={{ padding: 36, position: 'relative' }}>
              <div className="jt-corner jt-corner-tl" />
              <div className="jt-corner jt-corner-tr" />
              <div className="jt-corner jt-corner-bl" />
              <div className="jt-corner jt-corner-br" />

              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', margin: 0 }}>
                  TON BADGE
                </h2>
                <div className="jt-badge">
                  <div className="jt-dot" />
                  {TYPE_LABELS[templateType]}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Name */}
                <div>
                  <label className="jt-label">Nom complet</label>
                  <input
                    className="jt-input"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setPreviewUrl(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Prénom Nom"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="jt-label">Photo de profil</label>
                  <div
                    className={`jt-upload-zone${isDragging ? ' drag' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    {photoPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          style={{
                            width: 96, height: 96, objectFit: 'cover', borderRadius: '50%',
                            border: '3px solid #22C55E',
                            boxShadow: '0 0 24px rgba(34,197,94,0.4)',
                          }}
                        />
                        <span style={{ fontSize: 13, color: '#4d7a57' }}>Cliquer pour changer</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                  </div>
                </div>

                {/* Generate button */}
                <button
                  className="jt-btn-primary"
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  style={{ marginTop: 8 }}
                >
                  {isGenerating ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin-slow 0.8s linear infinite' }}>
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

            {/* Right: Preview */}
            <div className="jt-card" style={{ padding: 36, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div className="jt-corner jt-corner-tl" />
              <div className="jt-corner jt-corner-tr" />
              <div className="jt-corner jt-corner-bl" />
              <div className="jt-corner jt-corner-br" />

              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', margin: '0 0 24px' }}>
                APERÇU
              </h2>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                {previewUrl ? (
                  <>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img
                        src={previewUrl}
                        alt="Carte générée"
                        style={{
                          width: '100%', height: 'auto', borderRadius: 12,
                          border: '2px solid rgba(34,197,94,0.35)',
                          boxShadow: '0 0 50px rgba(34,197,94,0.25)',
                          display: 'block',
                        }}
                      />
                    </div>
                    <button className="jt-btn-secondary" onClick={downloadCard}>
                      <Download size={18} strokeWidth={2} />
                      Télécharger ma card
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{
                      width: 110, height: 110, borderRadius: '50%', margin: '0 auto 24px',
                      border: '2px dashed rgba(34,197,94,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(34,197,94,0.04)',
                    }}>
                      <ImageIcon size={44} color="rgba(34,197,94,0.25)" strokeWidth={1.5} />
                    </div>
                    <p style={{ color: '#2d5435', fontSize: 14, margin: 0, fontFamily: 'Exo 2, sans-serif' }}>
                      Ta card apparaîtra ici<br />après génération
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 40, color: '#1e3d26', fontSize: 12, letterSpacing: '0.18em', fontFamily: 'Orbitron, sans-serif' }}>
            JUNE TECH @ KIT-HUB — LE DIGITAL EST ABORDABLE
          </p>
        </div>
      </div>
    </>
  )
}
