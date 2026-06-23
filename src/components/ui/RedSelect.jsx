import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../../store/useStore'

// Dropdown del campo "Red" con opción de añadir valores nuevos
// (Factory Unlocked, Locked, Claro, Altice… + los que agregues).
export default function RedSelect({ id, value, onChange }) {
  const redes = useStore((s) => s.settings.redes || [])
  const addRed = useStore((s) => s.addRed)
  const [adding, setAdding] = useState(false)
  const [nuevo, setNuevo] = useState('')

  const confirmar = () => {
    const v = nuevo.trim()
    if (!v) return
    addRed(v)
    onChange(v)
    setNuevo('')
    setAdding(false)
  }

  if (adding) {
    return (
      <div className="flex items-center gap-2">
        <input
          className="field"
          placeholder="Nueva red"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmar() } }}
          autoFocus
        />
        <button type="button" className="rounded-lg bg-brand-gradient p-2.5 text-white dark:bg-brand-gradient-premium" onClick={confirmar} aria-label="Agregar red">
          <Plus size={16} />
        </button>
        <button type="button" className="rounded-lg p-2.5 text-light-muted hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => setAdding(false)} aria-label="Cancelar">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <select
      id={id}
      className="field"
      value={value || ''}
      onChange={(e) => (e.target.value === '__add__' ? setAdding(true) : onChange(e.target.value))}
    >
      <option value="">—</option>
      {redes.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
      {/* conserva un valor antiguo que ya no esté en la lista */}
      {value && !redes.includes(value) && <option value={value}>{value}</option>}
      <option value="__add__">+ Añadir red…</option>
    </select>
  )
}
