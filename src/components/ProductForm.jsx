import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Plus, X } from 'lucide-react'
import Modal from './ui/Modal'
import { useStore } from '../store/useStore'
import { TIPO_OPTIONS, TIPO_COLORS } from '../lib/stock'

const REDES = ['Liberado', 'Operador', 'Claro', 'Altice', 'Viva']
const CONDICIONES = [
  { value: '', label: 'No aplica' },
  { value: 'factory', label: 'Factory Unlocked' },
  { value: 'semi', label: 'Semi-Factory' },
]

const EMPTY = {
  nombre: '', categoriaId: '', sku: '', imagen: '',
  precioCompra: '', precioVenta: '', proveedor: '',
  tipo: 'A',
  capacidad: '', imei: '', red: '', condicion: '',
}

export default function ProductForm({ open, onClose, producto }) {
  const categorias = useStore((s) => s.categorias)
  const addProducto = useStore((s) => s.addProducto)
  const updateProducto = useStore((s) => s.updateProducto)
  const addCategoria = useStore((s) => s.addCategoria)

  const [form, setForm] = useState(EMPTY)
  const [newCat, setNewCat] = useState(null) // { nombre, color } | null
  const fileRef = useRef(null)
  const editing = Boolean(producto)

  useEffect(() => {
    if (!open) return
    if (producto) {
      setForm({ ...EMPTY, ...producto })
    } else {
      setForm({ ...EMPTY, categoriaId: categorias[0]?.id || '' })
    }
    setNewCat(null)
  }, [open, producto]) // eslint-disable-line

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Lee la imagen como dataURL (se persiste en localStorage).
  const onImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, imagen: reader.result }))
    reader.readAsDataURL(file)
  }

  const crearCategoria = () => {
    if (!newCat?.nombre?.trim()) return
    const cat = addCategoria(newCat)
    setForm((f) => ({ ...f, categoriaId: cat.id }))
    setNewCat(null)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.categoriaId) return
    if (editing) {
      updateProducto(producto.id, form)
    } else {
      addProducto(form)
    }
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar producto' : 'Nuevo producto'} size="lg">
      <form onSubmit={submit} className="space-y-5">
        {/* Imagen */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-light-border bg-light-bg2 text-light-muted transition hover:border-brand-orange dark:border-dark-border dark:bg-dark-bg"
            aria-label="Subir imagen"
          >
            {form.imagen ? (
              <img src={form.imagen} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={24} />
            )}
          </button>
          <div className="text-sm text-light-muted dark:text-dark-muted">
            <p className="font-grotesk font-bold text-light-text dark:text-dark-text">Imagen del producto</p>
            <p>Opcional · toca para subir</p>
            {form.imagen && (
              <button type="button" className="mt-1 text-xs text-brand-red hover:underline" onClick={() => setForm((f) => ({ ...f, imagen: '' }))}>
                Quitar imagen
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </div>

        {/* Nombre + categoría */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-nombre">Nombre *</label>
            <input id="p-nombre" className="field" value={form.nombre} onChange={set('nombre')} required autoFocus placeholder="iPhone 15 Pro Max" />
          </div>

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
                <button type="button" className="rounded-lg bg-brand-gradient p-2.5 text-white" onClick={crearCategoria} aria-label="Crear categoría">
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
                onChange={(e) => {
                  if (e.target.value === '__new__') setNewCat({ nombre: '', color: '#FF6A00' })
                  else set('categoriaId')(e)
                }}
                required
              >
                <option value="" disabled>Selecciona…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
                <option value="__new__">+ Nueva categoría</option>
              </select>
            )}
          </div>

          <div>
            <label className="label" htmlFor="p-sku">Código / SKU</label>
            <input id="p-sku" className="field" value={form.sku} onChange={set('sku')} placeholder="Se genera si lo dejas vacío" />
          </div>
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

        {/* Grado del producto (Tipo A/B/C) */}
        <div>
          <span className="label">Tipo / condición del producto</span>
          <div className="grid grid-cols-3 gap-2">
            {TIPO_OPTIONS.map((t) => {
              const active = form.tipo === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                  className={`rounded-xl border px-4 py-3 font-grotesk font-bold transition ${
                    active ? 'border-transparent text-white shadow-soft' : 'border-light-border text-light-muted dark:border-dark-border dark:text-dark-muted'
                  }`}
                  style={active ? { backgroundColor: TIPO_COLORS[t] } : undefined}
                >
                  Tipo {t}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="p-prov">Proveedor (opcional)</label>
          <input id="p-prov" className="field" value={form.proveedor} onChange={set('proveedor')} />
        </div>

        {/* Específicos de equipos */}
        <details className="rounded-card border border-light-border p-4 dark:border-dark-border" open={Boolean(form.capacidad || form.imei || form.red || form.condicion)}>
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
            <div>
              <label className="label" htmlFor="p-red">Red</label>
              <select id="p-red" className="field" value={form.red} onChange={set('red')}>
                <option value="">—</option>
                {REDES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="p-cond">Condición</label>
              <select id="p-cond" className="field" value={form.condicion} onChange={set('condicion')}>
                {CONDICIONES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
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
