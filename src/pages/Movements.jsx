import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowDownToLine, ArrowUpFromLine, History, Trash2, X, CheckSquare, Square, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { fmtDateTime } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import ProductThumb from '../components/ui/ProductThumb'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ProductForm from '../components/ProductForm'

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
  const deleteMovimientos = useStore((s) => s.deleteMovimientos)

  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editProducto, setEditProducto] = useState(null)

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

  const toggleSel = (id) =>
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const selectAll = () => setSelected(new Set(lista.map((m) => m.id)))
  const clearSel = () => setSelected(new Set())
  const exitSelect = () => { setSelectMode(false); clearSel() }
  const confirmarBorrado = () => { deleteMovimientos([...selected]); exitSelect(); setConfirmOpen(false) }

  return (
    <PageShell title="Historial" subtitle="Actividad del inventario (altas y ventas)">
      <div className="card mb-4 flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por producto o motivo…" className="field pl-9" aria-label="Buscar en el historial" />
          </div>
          {!selectMode ? (
            <button className="btn-ghost" onClick={() => setSelectMode(true)} disabled={lista.length === 0}>
              <Trash2 size={17} /> Eliminar
            </button>
          ) : (
            <button className="btn-ghost" onClick={exitSelect}>
              <X size={17} /> Cancelar
            </button>
          )}
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

        {/* Barra de selección */}
        {selectMode && (
          <div className="flex flex-wrap items-center gap-3 border-t border-light-border pt-3 dark:border-dark-border">
            <button className="text-xs font-grotesk font-bold text-brand-orange hover:underline" onClick={selectAll}>Seleccionar todo</button>
            <button className="text-xs font-grotesk font-bold text-light-muted hover:underline dark:text-dark-muted" onClick={clearSel}>Anular selección</button>
            <span className="ml-auto text-sm text-light-muted dark:text-dark-muted">{selected.size} seleccionado{selected.size === 1 ? '' : 's'}</span>
            <button className="btn-primary !bg-none !bg-brand-red !py-2" disabled={selected.size === 0} onClick={() => setConfirmOpen(true)}>
              <Trash2 size={16} /> Eliminar ({selected.size})
            </button>
          </div>
        )}
      </div>

      {lista.length === 0 ? (
        <EmptyState icon={History} title="Sin actividad" subtitle="Aquí verás cuándo agregas un producto y cuándo lo vendes." />
      ) : (
        <div className="card divide-y divide-light-border dark:divide-dark-border">
          {lista.map((m) => {
            const meta = TIPO_META[m.tipo] || TIPO_META.entrada
            const p = productoById(m.productoId)
            const c = p ? categoriaById(p.categoriaId) : null
            const checked = selected.has(m.id)
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 p-4 ${selectMode ? 'cursor-pointer' : ''} ${checked ? 'bg-brand-orange/5' : ''}`}
                onClick={() => selectMode && toggleSel(m.id)}
              >
                {selectMode && (
                  <span className="shrink-0" aria-hidden="true">
                    {checked ? <CheckSquare size={20} className="text-brand-orange" /> : <Square size={20} className="text-light-muted dark:text-dark-muted" />}
                  </span>
                )}
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                  <meta.icon size={18} />
                </span>
                <ProductThumb producto={p} categoria={c} size={40} />
                <div className="min-w-0 flex-1">
                  {p && !selectMode ? (
                    <Link to={`/productos/${p.id}`} className="truncate font-grotesk font-bold text-light-text hover:underline dark:text-dark-text">{p.nombre}</Link>
                  ) : (
                    <span className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{p?.nombre || 'Producto eliminado'}</span>
                  )}
                  <p className="truncate text-xs text-light-muted dark:text-dark-muted">{m.motivo || meta.label} · {fmtDateTime(m.fecha)}</p>
                </div>
                {!selectMode && p && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditProducto(p) }}
                    className="shrink-0 rounded-lg p-2 text-light-muted transition hover:bg-light-bg2 dark:text-dark-muted dark:hover:bg-dark-border"
                    aria-label="Editar producto"
                    title="Editar producto"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <span className="rounded-pill px-2.5 py-1 text-xs font-grotesk font-bold" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmar borrado */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Eliminar del historial" size="sm">
        <p className="text-sm text-light-text dark:text-dark-text">
          ¿Eliminar <strong>{selected.size}</strong> registro{selected.size === 1 ? '' : 's'} del historial? Esta acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setConfirmOpen(false)}>Cancelar</button>
          <button className="btn-primary !bg-none !bg-brand-red" onClick={confirmarBorrado}>Eliminar</button>
        </div>
      </Modal>

      {/* Editar el producto del registro */}
      <ProductForm open={Boolean(editProducto)} producto={editProducto} onClose={() => setEditProducto(null)} />
    </PageShell>
  )
}
