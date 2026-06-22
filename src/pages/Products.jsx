import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Plus, Download, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { productBadge } from '../lib/stock'
import { money } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import ProductForm from '../components/ProductForm'
import ProductThumb from '../components/ui/ProductThumb'
import CategoryPill from '../components/ui/CategoryPill'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { Package } from 'lucide-react'

const PAGE_SIZE = 10

export default function Products() {
  const productos = useStore((s) => s.productos)
  const categorias = useStore((s) => s.categorias)
  const categoriaById = useStore((s) => s.categoriaById)
  const deleteProducto = useStore((s) => s.deleteProducto)
  const currency = useStore((s) => s.settings.currency)
  const navigate = useNavigate()

  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('cat') || 'todas'

  const [view, setView] = useState('list') // list | grid
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const setQ = (value) => { setParams((p) => { value ? p.set('q', value) : p.delete('q'); return p }, { replace: true }); setPage(1) }
  const setCat = (value) => { setParams((p) => { value === 'todas' ? p.delete('cat') : p.set('cat', value); return p }, { replace: true }); setPage(1) }

  // Filtrado
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return productos.filter((p) => {
      if (cat !== 'todas' && p.categoriaId !== cat) return false
      if (!needle) return true
      return (
        p.nombre.toLowerCase().includes(needle) ||
        (p.sku || '').toLowerCase().includes(needle) ||
        (p.imei || '').toLowerCase().includes(needle)
      )
    })
  }, [productos, q, cat])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (p) => { setEditing(p); setFormOpen(true) }

  // Exportar a CSV
  const exportCsv = () => {
    const headers = ['Nombre', 'SKU', 'Categoria', 'Tipo', 'Precio compra', 'Precio venta', 'Estado']
    const rows = filtered.map((p) => {
      const c = categoriaById(p.categoriaId)
      const estado = p.estado === 'vendido' ? 'Vendido' : 'Disponible'
      return [p.nombre, p.sku, c?.nombre || '', `Tipo ${p.tipo || 'A'}`, p.precioCompra, p.precioVenta, estado]
    })
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventario-ventura-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageShell title="Productos" subtitle="Catálogo e inventario">
      {/* Barra de herramientas */}
      <div className="card mb-4 flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, SKU o IMEI…"
              className="field pl-9"
              aria-label="Buscar producto"
            />
          </div>

          {/* Filtro de categoría — dropdown en escritorio */}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="field hidden w-auto sm:block"
            aria-label="Filtrar por categoría"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          {/* Conmutador de vista */}
          <div className="hidden overflow-hidden rounded-xl border border-light-border dark:border-dark-border sm:flex">
            <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-brand-gradient text-white dark:bg-brand-gradient-premium' : 'text-light-muted'}`} aria-label="Vista lista" aria-pressed={view === 'list'}>
              <List size={18} />
            </button>
            <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-brand-gradient text-white dark:bg-brand-gradient-premium' : 'text-light-muted'}`} aria-label="Vista cuadrícula" aria-pressed={view === 'grid'}>
              <LayoutGrid size={18} />
            </button>
          </div>

          <button className="btn-ghost" onClick={exportCsv}>
            <Download size={17} /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={18} /> <span className="hidden sm:inline">Agregar producto</span>
          </button>
        </div>

        {/* Filtro de categoría — chips en móvil */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
          <Chip active={cat === 'todas'} onClick={() => setCat('todas')}>Todas</Chip>
          {categorias.map((c) => (
            <Chip key={c.id} active={cat === c.id} color={c.color} onClick={() => setCat(c.id)}>{c.nombre}</Chip>
          ))}
        </div>

        <p className="text-sm text-light-muted dark:text-dark-muted">
          <strong className="text-light-text dark:text-dark-text">{filtered.length}</strong> producto{filtered.length === 1 ? '' : 's'}
          {q || cat !== 'todas' ? ' (filtrados)' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No se encontraron productos"
          subtitle="Ajusta la búsqueda o agrega un producto nuevo a tu inventario."
          action={<button className="btn-primary" onClick={openNew}><Plus size={18} /> Agregar producto</button>}
        />
      ) : view === 'grid' ? (
        /* ----- Vista cuadrícula ----- */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((p) => {
            const c = categoriaById(p.categoriaId)
            const st = productBadge(p)
            return (
              <div key={p.id} className="card flex cursor-pointer flex-col gap-3 p-4" onClick={() => navigate(`/productos/${p.id}`)}>
                <div className="flex items-start gap-3">
                  <ProductThumb producto={p} categoria={c} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{p.nombre}</p>
                    <p className="truncate text-xs text-light-muted dark:text-dark-muted">{p.sku}</p>
                  </div>
                  <Badge state={st} />
                </div>
                <div className="flex items-center justify-between">
                  <CategoryPill categoria={c} />
                </div>
                <div className="flex items-end justify-between border-t border-light-border pt-3 dark:border-dark-border">
                  <div>
                    <p className="text-xs text-light-muted dark:text-dark-muted">Precio venta</p>
                    <p className="font-display font-extrabold text-light-text dark:text-dark-text">{money(p.precioVenta, currency)}</p>
                  </div>
                  <div className="flex gap-1">
                    <IconBtn label="Editar" onClick={() => openEdit(p)}><Pencil size={17} /></IconBtn>
                    <IconBtn label="Eliminar" danger onClick={() => setToDelete(p)}><Trash2 size={17} /></IconBtn>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ----- Vista lista: tarjetas en móvil, tabla en escritorio ----- */
        <>
          {/* Móvil */}
          <div className="space-y-3 lg:hidden">
            {pageItems.map((p) => {
              const c = categoriaById(p.categoriaId)
              const st = productBadge(p)
              return (
                <div key={p.id} className="card p-4" onClick={() => navigate(`/productos/${p.id}`)}>
                  <div className="flex items-center gap-3">
                    <ProductThumb producto={p} categoria={c} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{p.nombre}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryPill categoria={c} />
                      </div>
                    </div>
                    <Badge state={st} />
                  </div>
                  <div className="mt-3 flex items-center justify-end border-t border-light-border pt-3 text-sm dark:border-dark-border">
                    <span className="font-display font-extrabold text-light-text dark:text-dark-text">{money(p.precioVenta, currency)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Escritorio: tabla */}
          <div className="card hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-light-border text-left text-xs font-grotesk font-bold uppercase tracking-wide text-light-muted dark:border-dark-border dark:text-dark-muted">
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Precio venta</th>
                    <th className="px-4 py-3 text-right">Precio compra</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => {
                    const c = categoriaById(p.categoriaId)
                    const st = productBadge(p)
                    return (
                      <tr key={p.id} className="cursor-pointer border-b border-light-border last:border-0 hover:bg-light-bg2/60 dark:border-dark-border dark:hover:bg-dark-border/40" onClick={() => navigate(`/productos/${p.id}`)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-left">
                            <ProductThumb producto={p} categoria={c} size={40} />
                            <div>
                              <p className="font-semibold text-light-text dark:text-dark-text">{p.nombre}</p>
                              <p className="text-xs text-light-muted dark:text-dark-muted">{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><CategoryPill categoria={c} /></td>
                        <td className="px-4 py-3 text-right font-semibold text-light-text dark:text-dark-text">{money(p.precioVenta, currency)}</td>
                        <td className="px-4 py-3 text-right text-light-muted dark:text-dark-muted">{money(p.precioCompra, currency)}</td>
                        <td className="px-4 py-3"><Badge state={st} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <IconBtn label="Editar" onClick={() => openEdit(p)}><Pencil size={16} /></IconBtn>
                            <IconBtn label="Eliminar" danger onClick={() => setToDelete(p)}><Trash2 size={16} /></IconBtn>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Paginación */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Mostrando {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost disabled:opacity-40" disabled={current <= 1} onClick={() => setPage(current - 1)}>Anterior</button>
            <span className="grid place-items-center px-2 font-grotesk font-bold text-light-text dark:text-dark-text">{current} / {totalPages}</span>
            <button className="btn-ghost disabled:opacity-40" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>Siguiente</button>
          </div>
        </div>
      )}

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} producto={editing} />

      {/* Confirmar borrado */}
      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Eliminar producto" size="sm">
        <p className="text-sm text-light-text dark:text-dark-text">
          ¿Seguro que deseas eliminar <strong>{toDelete?.nombre}</strong>? Se borrarán también sus movimientos. Esta acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancelar</button>
          <button className="btn-primary !bg-none !bg-brand-red" onClick={() => { deleteProducto(toDelete.id); setToDelete(null) }}>Eliminar</button>
        </div>
      </Modal>
    </PageShell>
  )
}

// --- subcomponentes ---
function Chip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-pill border px-3 py-1.5 text-xs font-grotesk font-bold transition ${
        active ? 'border-transparent text-white' : 'border-light-border text-light-muted dark:border-dark-border dark:text-dark-muted'
      }`}
      style={active ? { backgroundColor: color || '#FF6A00' } : undefined}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition hover:bg-light-bg2 dark:hover:bg-dark-border ${danger ? 'text-brand-red' : 'text-light-muted dark:text-dark-muted'}`}
    >
      {children}
    </button>
  )
}
