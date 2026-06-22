import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react'
import { useStore } from '../store/useStore'
import { fmtDateTime } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import ProductThumb from '../components/ui/ProductThumb'
import EmptyState from '../components/ui/EmptyState'

// Historial automático: alta de productos (entrada) y ventas (salida).
const TIPO_META = {
  entrada: { label: 'Agregado', icon: ArrowDownToLine, color: '#16A34A' },
  salida: { label: 'Vendido', icon: ArrowUpFromLine, color: '#E11D48' },
}

const FILTROS = [
  { value: 'todos', label: 'Todo' },
  { value: 'entrada', label: 'Agregados' },
  { value: 'salida', label: 'Vendidos' },
]

export default function Movements() {
  const movimientos = useStore((s) => s.movimientos)
  const productoById = useStore((s) => s.productoById)
  const categoriaById = useStore((s) => s.categoriaById)

  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const lista = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...movimientos]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .filter((m) => {
        if (filtro !== 'todos' && m.tipo !== filtro) return false
        if (!needle) return true
        const p = productoById(m.productoId)
        return (p?.nombre || '').toLowerCase().includes(needle) || (m.motivo || '').toLowerCase().includes(needle)
      })
  }, [movimientos, q, filtro, productoById])

  return (
    <PageShell title="Historial" subtitle="Actividad del inventario (altas y ventas)">
      <div className="card mb-4 flex flex-col gap-3 p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por producto o motivo…" className="field pl-9" aria-label="Buscar en el historial" />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`shrink-0 rounded-pill border px-3 py-1.5 text-xs font-grotesk font-bold transition ${
                filtro === f.value ? 'border-transparent bg-brand-gradient text-white dark:bg-brand-gradient-premium' : 'border-light-border text-light-muted dark:border-dark-border dark:text-dark-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <EmptyState icon={History} title="Sin actividad" subtitle="Aquí verás cuándo agregas un producto y cuándo lo vendes." />
      ) : (
        <div className="card divide-y divide-light-border dark:divide-dark-border">
          {lista.map((m) => {
            const meta = TIPO_META[m.tipo] || TIPO_META.entrada
            const p = productoById(m.productoId)
            const c = p ? categoriaById(p.categoriaId) : null
            return (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                  <meta.icon size={18} />
                </span>
                <ProductThumb producto={p} categoria={c} size={40} />
                <div className="min-w-0 flex-1">
                  {p ? (
                    <Link to={`/productos/${p.id}`} className="truncate font-grotesk font-bold text-light-text hover:underline dark:text-dark-text">{p.nombre}</Link>
                  ) : (
                    <span className="truncate font-grotesk font-bold text-light-muted">Producto eliminado</span>
                  )}
                  <p className="truncate text-xs text-light-muted dark:text-dark-muted">{m.motivo || meta.label} · {fmtDateTime(m.fecha)}</p>
                </div>
                <span className="rounded-pill px-2.5 py-1 text-xs font-grotesk font-bold" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
