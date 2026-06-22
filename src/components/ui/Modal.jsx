import { useEffect } from 'react'
import { X } from 'lucide-react'

// Modal accesible: cierra con Escape y clic en el fondo. Bloquea el scroll.
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`card animate-pop w-full ${widths[size]} max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-card`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-light-border bg-light-surface/95 px-5 py-4 backdrop-blur dark:border-dark-border dark:bg-dark-surface/95">
          <h2 className="font-display text-lg font-extrabold text-light-text dark:text-dark-text">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-light-muted transition hover:bg-light-bg2 dark:hover:bg-dark-border"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
