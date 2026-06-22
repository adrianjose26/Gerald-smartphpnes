import { useState } from 'react'
import { Coins, Moon, Sun, Tag, Plus, Trash2, Pencil, RotateCcw, Check, X, Phone, Clock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CURRENCIES } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import Modal from '../components/ui/Modal'

export default function Settings() {
  const settings = useStore((s) => s.settings)
  const setCurrency = useStore((s) => s.setCurrency)
  const setTheme = useStore((s) => s.setTheme)
  const setAutoDeleteDays = useStore((s) => s.setAutoDeleteDays)
  const categorias = useStore((s) => s.categorias)
  const productos = useStore((s) => s.productos)
  const addCategoria = useStore((s) => s.addCategoria)
  const updateCategoria = useStore((s) => s.updateCategoria)
  const deleteCategoria = useStore((s) => s.deleteCategoria)
  const resetDemo = useStore((s) => s.resetDemo)

  const [nueva, setNueva] = useState({ nombre: '', color: '#FF6A00' })
  const [editId, setEditId] = useState(null)
  const [edit, setEdit] = useState({ nombre: '', color: '' })
  const [toDelete, setToDelete] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)

  const countProd = (id) => productos.filter((p) => p.categoriaId === id).length

  const crear = () => {
    if (!nueva.nombre.trim()) return
    addCategoria(nueva)
    setNueva({ nombre: '', color: '#FF6A00' })
  }
  const guardarEdit = () => {
    updateCategoria(editId, edit)
    setEditId(null)
  }

  return (
    <PageShell title="Ajustes" subtitle="Configuración de la app">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Moneda */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Coins size={18} className="text-brand-orange" />
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Moneda</h3>
          </div>
          <p className="mb-3 text-sm text-light-muted dark:text-dark-muted">Se usará el símbolo seleccionado en toda la app.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  settings.currency === code ? 'border-brand-orange bg-brand-orange/10' : 'border-light-border dark:border-dark-border'
                }`}
              >
                <p className="font-display text-lg font-extrabold text-light-text dark:text-dark-text">{c.symbol}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">{code}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tema */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon size={18} className="text-brand-cyan" /> : <Sun size={18} className="text-brand-yellow" />}
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Tema</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTheme('light')} className={`rounded-xl border px-4 py-3 transition ${settings.theme === 'light' ? 'border-brand-orange bg-brand-orange/10' : 'border-light-border dark:border-dark-border'}`}>
              <Sun size={20} className="mx-auto mb-1 text-brand-yellow" />
              <p className="text-sm font-grotesk font-bold text-light-text dark:text-dark-text">Claro</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">Energético</p>
            </button>
            <button onClick={() => setTheme('dark')} className={`rounded-xl border px-4 py-3 transition ${settings.theme === 'dark' ? 'border-brand-orange bg-brand-orange/10' : 'border-light-border dark:border-dark-border'}`}>
              <Moon size={20} className="mx-auto mb-1 text-brand-cyan" />
              <p className="text-sm font-grotesk font-bold text-light-text dark:text-dark-text">Oscuro</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">Premium</p>
            </button>
          </div>
        </div>

        {/* Eliminación automática de vendidos */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Clock size={18} className="text-brand-cyan" />
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Eliminación automática de vendidos</h3>
          </div>
          <p className="mb-3 text-sm text-light-muted dark:text-dark-muted">
            Los productos vendidos se eliminan solos pasado este tiempo. Las facturas se conservan como historial.
          </p>
          <div className="flex flex-wrap gap-2">
            {[{ v: 0, l: 'Nunca' }, { v: 1, l: '1 día' }, { v: 2, l: '2 días' }, { v: 3, l: '3 días' }, { v: 7, l: '7 días' }].map((o) => (
              <button
                key={o.v}
                onClick={() => setAutoDeleteDays(o.v)}
                className={`rounded-pill border px-4 py-2 text-sm font-grotesk font-bold transition ${
                  Number(settings.autoDeleteDays) === o.v
                    ? 'border-transparent bg-brand-gradient text-white dark:bg-brand-gradient-premium'
                    : 'border-light-border text-light-muted dark:border-dark-border dark:text-dark-muted'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Categorías */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Tag size={18} className="text-brand-red" />
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Categorías</h3>
          </div>

          {/* Crear */}
          <div className="mb-4 flex items-center gap-2">
            <input className="field" placeholder="Nueva categoría" value={nueva.nombre} onChange={(e) => setNueva((n) => ({ ...n, nombre: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && crear()} />
            <input type="color" value={nueva.color} onChange={(e) => setNueva((n) => ({ ...n, color: e.target.value }))} className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-light-border bg-transparent dark:border-dark-border" aria-label="Color" />
            <button className="btn-primary shrink-0" onClick={crear}><Plus size={18} /> Agregar</button>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categorias.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-light-border p-3 dark:border-dark-border">
                {editId === c.id ? (
                  <>
                    <input type="color" value={edit.color} onChange={(e) => setEdit((s) => ({ ...s, color: e.target.value }))} className="h-8 w-9 shrink-0 cursor-pointer rounded border border-light-border bg-transparent dark:border-dark-border" />
                    <input className="field !py-1.5" value={edit.nombre} onChange={(e) => setEdit((s) => ({ ...s, nombre: e.target.value }))} autoFocus />
                    <button className="rounded-lg p-2 text-stock-ok hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={guardarEdit} aria-label="Guardar"><Check size={16} /></button>
                    <button className="rounded-lg p-2 text-light-muted hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => setEditId(null)} aria-label="Cancelar"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="h-7 w-7 shrink-0 rounded-lg" style={{ backgroundColor: c.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{c.nombre}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted">{countProd(c.id)} producto{countProd(c.id) === 1 ? '' : 's'}</p>
                    </div>
                    <button className="rounded-lg p-2 text-light-muted hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => { setEditId(c.id); setEdit({ nombre: c.nombre, color: c.color }) }} aria-label="Editar"><Pencil size={15} /></button>
                    <button className="rounded-lg p-2 text-brand-red hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => setToDelete(c)} aria-label="Eliminar"><Trash2 size={15} /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Negocio + datos */}
        <div className="card p-5">
          <h3 className="mb-3 font-display text-base font-bold text-light-text dark:text-dark-text">Negocio</h3>
          <p className="font-display text-xl font-extrabold text-light-text dark:text-dark-text">Ventura Smart Phone</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted"><Phone size={14} /> 809.986.1389</p>
          <p className="mt-1 text-sm font-grotesk font-bold tracking-widest text-brand-orange">@VENTURASMARTPHONE</p>
        </div>

        {/* Datos de ejemplo */}
        <div className="card p-5">
          <h3 className="mb-1 font-display text-base font-bold text-light-text dark:text-dark-text">Datos de ejemplo</h3>
          <p className="mb-3 text-sm text-light-muted dark:text-dark-muted">Restaura el inventario, clientes y movimientos de demostración. Se perderán los cambios actuales.</p>
          <button className="btn-ghost" onClick={() => setResetOpen(true)}><RotateCcw size={16} /> Restaurar demo</button>
        </div>
      </div>

      {/* Confirmar borrado de categoría */}
      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Eliminar categoría" size="sm">
        <p className="text-sm text-light-text dark:text-dark-text">
          {countProd(toDelete?.id) > 0
            ? <>La categoría <strong>{toDelete?.nombre}</strong> tiene {countProd(toDelete?.id)} producto(s). Se moverán a la categoría <strong>"Otros"</strong>.</>
            : <>¿Eliminar la categoría <strong>{toDelete?.nombre}</strong>?</>}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancelar</button>
          <button className="btn-primary !bg-none !bg-brand-red" onClick={() => { deleteCategoria(toDelete.id); setToDelete(null) }}>Eliminar</button>
        </div>
      </Modal>

      {/* Confirmar reset */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Restaurar datos de ejemplo" size="sm">
        <p className="text-sm text-light-text dark:text-dark-text">¿Seguro? Esto reemplaza todos los datos actuales por los de demostración.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setResetOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { resetDemo(); setResetOpen(false) }}>Restaurar</button>
        </div>
      </Modal>
    </PageShell>
  )
}
