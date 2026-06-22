import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import { useStore } from '../store/useStore'

// Formulario para agregar / editar un cliente.
const EMPTY = { nombre: '', telefono: '', email: '', nota: '' }

export default function CustomerForm({ open, onClose, cliente }) {
  const addCliente = useStore((s) => s.addCliente)
  const updateCliente = useStore((s) => s.updateCliente)
  const [form, setForm] = useState(EMPTY)
  const editing = Boolean(cliente)

  useEffect(() => {
    if (open) setForm(cliente ? { ...EMPTY, ...cliente } : EMPTY)
  }, [open, cliente])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (editing) updateCliente(cliente.id, form)
    else addCliente(form)
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar cliente' : 'Agregar cliente'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="cli-nombre">Nombre *</label>
          <input id="cli-nombre" className="field" value={form.nombre} onChange={set('nombre')} required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="cli-tel">Teléfono</label>
          <input id="cli-tel" className="field" value={form.telefono} onChange={set('telefono')} placeholder="+1 809-000-0000" inputMode="tel" />
        </div>
        <div>
          <label className="label" htmlFor="cli-email">Email (opcional)</label>
          <input id="cli-email" className="field" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="cli-nota">Nota (opcional)</label>
          <textarea id="cli-nota" className="field" rows={2} value={form.nota} onChange={set('nota')} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editing ? 'Guardar cambios' : 'Agregar cliente'}</button>
        </div>
      </form>
    </Modal>
  )
}
