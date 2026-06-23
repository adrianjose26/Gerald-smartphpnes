import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import Modal from './ui/Modal'
import { useStore } from '../store/useStore'
import { COND_OPTIONS, COND_LABEL, COND_COLORS } from '../lib/stock'
import RedSelect from './ui/RedSelect'

const EMPTY = {
  nombre: '', categoriaId: '',
  precioCompra: '', precioVenta: '',
  nuevoUsado: 'nuevo',
  capacidad: '', imei: '', red: '',
}

export default function ProductForm({ open, onClose, producto }) {
  const categorias = useStore((s) => s.categorias)
  const addProducto = useStore((s) => s.addProducto)
  const updateProducto = useStore((s) => s.updateProducto)
  const addCategoria = useStore((s) => s.addCategoria)

  const [form, setForm] = useState(EMPTY)
  const [newCat, setNewCat] = useState(null) // { nombre, color } | null
  const editing = Boolean(producto)

  useEffect(() => {
    if (!open) return
    if (producto) setForm({ ...EMPTY, ...producto })
    else setForm({ ...EMPTY, categoriaId: categorias[0]?.id || '' })
    setNewCat(null)
  }, [open, producto]) // eslint-disable-line

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const crearCategoria = () => {
    if (!newCat?.nombre?.trim()) return
    const cat = addCategoria(newCat)
    setForm((f) => ({ ...f, categoriaId: cat.id }))
    setNewCat(null)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.categoriaId) return
    if (editing) updateProducto(producto.id, form)
    else addProducto(form)
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar producto' : 'Nuevo producto'} size="lg">
      <form onSubmit={submit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="label" htmlFor="p-nombre">Nombre *</label>
          <input id="p-nombre" className="field" value={form.nombre} onChange={set('nombre')} required autoFocus placeholder="iPhone 15 Pro Max" />
        </div>

        {/* Categoría */}
        <div>
          <label className="label" htmlFor="p-cat">Categoría *</label>
          {newCat ? (
            <div className="flex items-center gap-2">
              <input
                className="field"
                placeholder="Nueva categoría"
                value={newCat.nombre}
                onChange={(e) => setNewCat((c) => ({ ...c, nombre: e.target.value }))}
                autoFocus
              />
              <input
                type="color"
                value={newCat.color}
                onChange={(e) => setNewCat((c) => ({ ...c, color: e.target.value }))}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-light-border bg-transparent dark:border-dark-border"
                aria-label="Color de la categoría"
              />
              <button type="button" className="rounded-lg bg-brand-gradient p-2.5 text-white dark:bg-brand-gradient-premium" onClick={crearCategoria} aria-label="Crear categoría">
                <Plus size={16} />
              </button>
              <button type="button" className="rounded-lg p-2.5 text-light-muted hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => setNewCat(null)} aria-label="Cancelar">
                <X size={16} />
              </button>
            </div>
          ) : (
            <select
              id="p-cat"
              className="field"
              value={form.categoriaId}
              onChange={(e) => { if (e.target.value === '__new__') setNewCat({ nombre: '', color: '#FF6A00' }); else set('categoriaId')(e) }}
              required
            >
              <option value="" disabled>Selecciona…</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              <option value="__new__">+ Nueva categoría</option>
            </select>
          )}
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="p-pc">Precio compra</label>
            <input id="p-pc" type="number" min="0" step="0.01" className="field" value={form.precioCompra} onChange={set('precioCompra')} />
          </div>
          <div>
            <label className="label" htmlFor="p-pv">Precio venta</label>
            <input id="p-pv" type="number" min="0" step="0.01" className="field" value={form.precioVenta} onChange={set('precioVenta')} />
          </div>
        </div>

        {/* Nuevo / Usado */}
        <div>
          <span className="label">Condición del producto</span>
          <div className="grid grid-cols-2 gap-2">
            {COND_OPTIONS.map((c) => {
              const active = form.nuevoUsado === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, nuevoUsado: c }))}
                  className={`rounded-xl border px-4 py-3 font-grotesk font-bold transition ${
                    active ? 'border-transparent text-white shadow-soft' : 'border-light-border text-light-muted dark:border-dark-border dark:text-dark-muted'
                  }`}
                  style={active ? { backgroundColor: COND_COLORS[c] } : undefined}
                >
                  {COND_LABEL[c]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Datos del equipo */}
        <details className="rounded-card border border-light-border p-4 dark:border-dark-border" open={Boolean(form.capacidad || form.imei || form.red)}>
          <summary className="cursor-pointer font-grotesk text-sm font-bold text-light-text dark:text-dark-text">
            Datos del equipo (celulares / laptops)
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="p-cap">Capacidad</label>
              <input id="p-cap" className="field" value={form.capacidad} onChange={set('capacidad')} placeholder="256GB" />
            </div>
            <div>
              <label className="label" htmlFor="p-imei">IMEI / Serial</label>
              <input id="p-imei" className="field" value={form.imei} onChange={set('imei')} placeholder="35xxxxxxxxxxxxx" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-red">Red</label>
              <RedSelect id="p-red" value={form.red} onChange={(v) => setForm((f) => ({ ...f, red: v }))} />
            </div>
          </div>
        </details>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editing ? 'Guardar cambios' : 'Guardar producto'}</button>
        </div>
      </form>
    </Modal>
  )
}
