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
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">JUNETECH 2026</h1>
          <p className="text-gray-400 text-sm">Génère ta card JuneTech</p>
        </div>

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
