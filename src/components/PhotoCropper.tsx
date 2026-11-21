'use client'

import { useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { MAX_ZOOM, coverCrop, minZoom, panCrop, setZoom, zoomOf, type Crop } from '@/lib/crop'
import s from './CardGenerator.module.css'

interface PhotoCropperProps {
  src: string
  imageSize: { w: number; h: number }
  crop: Crop
  onChange: (crop: Crop) => void
  viewport?: number
}

export default function PhotoCropper({ src, imageSize, crop, onChange, viewport = 240 }: PhotoCropperProps) {
  const { w, h } = imageSize
  const scale = viewport / crop.size
  const zoom = zoomOf(crop, w, h)
  const zMin = minZoom(w, h)

  // Active pointers, for one-finger pan and two-finger pinch
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDist = useRef<number | null>(null)
  const cropRef = useRef(crop)
  cropRef.current = crop

  const distance = () => {
    const [a, b] = Array.from(pointers.current.values())
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) pinchDist.current = distance()
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const current = cropRef.current

    if (pointers.current.size === 1) {
      onChange(panCrop(current, e.clientX - prev.x, e.clientY - prev.y, viewport / current.size, w, h))
    } else if (pointers.current.size === 2 && pinchDist.current) {
      const d = distance()
      onChange(setZoom(current, zoomOf(current, w, h) * (d / pinchDist.current), w, h))
      pinchDist.current = d
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchDist.current = null
  }

  // Native non-passive listener so zooming doesn't also scroll the page
  const viewportRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const current = cropRef.current
      onChangeRef.current(setZoom(current, zoomOf(current, w, h) * Math.exp(-e.deltaY * 0.0015), w, h))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [w, h])

  const nudgeZoom = (factor: number) => onChange(setZoom(crop, zoom * factor, w, h))

  return (
    <div className={s.cropper}>
      <div
        ref={viewportRef}
        className={s.cropViewport}
        style={{ width: viewport, height: viewport }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-testid="crop-viewport"
        aria-label="Zone de recadrage : glisse pour déplacer, pince ou molette pour zoomer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className={s.cropImg}
          style={{
            width: w * scale,
            height: h * scale,
            left: viewport / 2 - crop.cx * scale,
            top: viewport / 2 - crop.cy * scale,
          }}
        />
      </div>

      <div className={s.zoomRow}>
        <button type="button" className={s.iconBtn} onClick={() => nudgeZoom(1 / 1.15)} aria-label="Dézoomer">
          <ZoomOut size={16} />
        </button>
        <input
          type="range"
          className={s.range}
          min={Math.log(zMin)}
          max={Math.log(MAX_ZOOM)}
          step={0.001}
          value={Math.log(zoom)}
          onChange={(e) => onChange(setZoom(crop, Math.exp(Number(e.target.value)), w, h))}
          aria-label="Zoom"
        />
        <button type="button" className={s.iconBtn} onClick={() => nudgeZoom(1.15)} aria-label="Zoomer">
          <ZoomIn size={16} />
        </button>
        <button type="button" className={s.iconBtn} onClick={() => onChange(coverCrop(w, h))} aria-label="Réinitialiser le cadrage">
          <RotateCcw size={16} />
        </button>
      </div>
      <p className={s.hint}>Glisse pour déplacer · pince ou molette pour zoomer · dézoome à fond pour afficher un logo entier</p>
    </div>
  )
}
