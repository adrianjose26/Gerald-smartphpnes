import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

// Barra desplegable con búsqueda (combobox).
// options: [{ value, label, sublabel? }]
export default function SearchableSelect({ id, value, onChange, options = [], placeholder = 'Seleccionar…' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selected = options.find((o) => o.value === value)
  const needle = q.trim().toLowerCase()
  const filtered = needle
    ? options.filter((o) => o.label.toLowerCase().includes(needle) || (o.sublabel || '').toLowerCase().includes(needle))
    : options

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        className="field flex items-center justify-between gap-2 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${selected ? 'text-light-text dark:text-dark-text' : 'text-light-muted dark:text-dark-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-light-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-light-border bg-light-surface shadow-card dark:border-dark-border dark:bg-dark-surface">
          <div className="relative border-b border-light-border p-2 dark:border-dark-border">
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-light-muted" />
            <input
              className="field !py-2 pl-8"
              placeholder="Buscar…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-light-muted dark:text-dark-muted">Sin resultados</li>}
            {filtered.map((o) => (
              <li key={o.value || '__empty__'}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-light-bg2 dark:hover:bg-dark-border"
                  onClick={() => { onChange(o.value); setOpen(false); setQ('') }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-light-text dark:text-dark-text">{o.label}</span>
                    {o.sublabel && <span className="block truncate text-xs text-light-muted dark:text-dark-muted">{o.sublabel}</span>}
                  </span>
                  {o.value === value && <Check size={16} className="shrink-0 text-brand-orange" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
