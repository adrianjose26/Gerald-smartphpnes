import { useStore } from '../../store/useStore'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

// Notificación flotante (toast) controlada desde el store.
export default function Toast() {
  const toast = useStore((s) => s.toast)
  const clearToast = useStore((s) => s.clearToast)
  if (!toast) return null

  const tones = {
    success: { Icon: CheckCircle2, color: 'text-stock-ok' },
    info: { Icon: Info, color: 'text-brand-cyan' },
    warning: { Icon: AlertTriangle, color: 'text-stock-low' },
    error: { Icon: AlertTriangle, color: 'text-brand-red' },
  }
  const { Icon, color } = tones[toast.tone] || tones.success

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:bottom-6">
      <div className="card animate-pop pointer-events-auto flex max-w-md items-start gap-3 px-4 py-3 shadow-card">
        <Icon className={`mt-0.5 shrink-0 ${color}`} size={20} />
        <p className="text-sm font-medium text-light-text dark:text-dark-text">{toast.msg}</p>
        <button onClick={clearToast} className="ml-1 text-light-muted hover:text-light-text dark:hover:text-dark-text" aria-label="Cerrar">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
