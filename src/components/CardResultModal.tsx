'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, X } from 'lucide-react'
import { DEFAULT_EXPORT_KEY, EXPORT_PRESETS, formatBytes } from '@/config/exports'
import s from './CardGenerator.module.css'

interface CardResultModalProps {
  open: boolean
  previewUrl: string | null
  cardSize: number | null
  exports: Record<string, { blob: Blob }>
  onDownload: (presetKey: string) => void
  onClose: () => void
}

const FOCUSABLE = 'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'

export default function CardResultModal({ open, previewUrl, cardSize, exports, onDownload, onClose }: CardResultModalProps) {
  const [step, setStep] = useState<'view' | 'choose'>('view')
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Every opening starts on the visual, not on the quality list
  useEffect(() => {
    if (open) setStep('view')
  }, [open])

  // Lock page scroll, focus the dialog, give focus back on close
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      if (step === 'choose') setStep('view')
      else onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  if (!open) return null

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={onKeyDown}>
      <div
        ref={panelRef}
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <div className={s.modalHead}>
          {step === 'choose' ? (
            <button type="button" className={s.iconBtn} onClick={() => setStep('view')} aria-label="Retour au visuel">
              <ArrowLeft size={16} />
            </button>
          ) : <span />}
          <h2 id="result-title" className={s.modalTitle}>
            {step === 'choose' ? 'Choisis la qualité' : previewUrl ? 'Ton visuel est prêt' : 'Génération…'}
          </h2>
          <button ref={closeRef} type="button" className={s.iconBtn} onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Visuel généré"
            className={`${s.modalImg} ${step === 'choose' ? s.modalImgSmall : ''}`}
          />
        ) : (
          <div className={s.modalLoading} role="status">
            <svg className={s.spinner} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Création de ton visuel en haute définition…</span>
          </div>
        )}

        {previewUrl && step === 'view' && (
          <button type="button" className={s.btnSecondary} onClick={() => setStep('choose')}>
            <Download size={18} strokeWidth={2} />
            Télécharger
          </button>
        )}

        {previewUrl && step === 'choose' && (
          <div className={s.exportList} aria-label="Qualité du téléchargement">
            {EXPORT_PRESETS.map((p) => {
              const file = exports[p.key]
              const side = p.size ?? cardSize ?? 0
              return (
                <button
                  key={p.key}
                  type="button"
                  className={s.exportOption}
                  disabled={!file}
                  onClick={() => onDownload(p.key)}
                >
                  <span className={s.exportMain}>
                    {p.key === DEFAULT_EXPORT_KEY && <span className={s.exportBadge}>Recommandé</span>}
                    <span className={s.exportLabel}>{p.label}</span>
                    <span className={s.exportDesc}>{p.description}</span>
                  </span>
                  <span className={s.exportMeta}>
                    <span className={s.exportSize}>{file ? formatBytes(file.blob.size) : 'calcul…'}</span>
                    <span className={s.exportDims}>{side}×{side}px</span>
                  </span>
                  <Download size={18} className={s.exportIcon} aria-hidden />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
