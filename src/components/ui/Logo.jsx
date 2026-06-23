import { useState } from 'react'

// Insignia de marca: usa la imagen real de la tienda (public/logo.png).
// Si el archivo no existe todavía, cae a una insignia con el degradado de marca.
function BrandMark({ size = 36 }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <span className="grid shrink-0 place-items-center rounded-xl bg-brand-gradient shadow-soft" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" style={{ width: size * 0.62, height: size * 0.62 }} aria-hidden="true">
          <rect x="9" y="4" width="14" height="24" rx="4" fill="none" stroke="white" strokeWidth="2" />
          <path d="M12 9 L16 22 L20 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  return (
    <img
      src="/logo.png"
      alt="Ventura Smart Phone"
      onError={() => setError(true)}
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  )
}

// Logo / wordmark de Ventura Smart Phone.
// `variant`: 'full' (insignia + texto) | 'mark' (solo insignia) | 'wordmark' (solo texto)
export default function Logo({ variant = 'full', className = '', light = false, size }) {
  if (variant === 'mark') return <span className={className}><BrandMark size={size || 36} /></span>

  const Word = (
    <span className={`flex flex-col leading-none ${className}`}>
      <span
        className={`font-display text-[15px] font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-light-text dark:text-dark-text'
        }`}
      >
        VENTURA
      </span>
      <span className="font-grotesk text-[11px] font-bold tracking-[0.18em] text-brand-orange">
        SMARTPHONE
      </span>
    </span>
  )

  if (variant === 'wordmark') return Word

  return (
    <span className="flex items-center gap-2.5">
      <BrandMark size={size || 40} />
      {Word}
    </span>
  )
}
