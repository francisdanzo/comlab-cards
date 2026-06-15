'use client'

import { useState, useRef, useCallback } from 'react'
import { generateCard } from '@/lib/generateCard'

interface CardGeneratorProps {
  templateType: 'attendee' | 'speaker' | 'volunteer' | 'staff'
}

export default function CardGenerator({ templateType }: CardGeneratorProps) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canGenerate = !!name.trim() && !!photo

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

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo trop lourde (max 10MB)')
      return
    }
    setPhoto(file)
    setPreviewUrl(null)
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
    link.download = `junetech-2026-${name.trim().toLowerCase().replace(/\s+/g, '-')}.png`
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

        {/* Photo upload */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-950/20'
              : 'border-gray-700 hover:border-gray-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
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
            onChange={(e) => { setName(e.target.value); setPreviewUrl(null) }}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Prénom Nom"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Génération en cours…' : '▶ Générer ma card'}
        </button>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Prévisualisation</p>
            <img
              src={previewUrl}
              alt="Prévisualisation de ta card"
              className="w-full rounded-xl"
            />
          </div>
        )}

        {/* Download */}
        {previewUrl && (
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
