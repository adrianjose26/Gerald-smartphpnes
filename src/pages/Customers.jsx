import { useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Phone, Mail, FileText, Users } from 'lucide-react'
import { useStore } from '../store/useStore'
import { fmtDate } from '../lib/format'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Avatar from '../components/ui/Avatar'
import CustomerForm from '../components/CustomerForm'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

export default function Customers() {
  const clientes = useStore((s) => s.clientes)
  const facturas = useStore((s) => s.facturas)
  const deleteCliente = useStore((s) => s.deleteCliente)
  const navigate = useNavigate()

  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const lista = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...clientes]
      .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
      .filter((c) => !needle || c.nombre.toLowerCase().includes(needle) || (c.telefono || '').includes(needle))
  }, [clientes, q])

  const comprasDe = (id) => facturas.filter((f) => f.clienteId === id).length

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (c) => { setEditing(c); setFormOpen(true) }

  return (
    <PageShell title="Clientes" subtitle={`${clientes.length} clientes registrados`}>
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente…" className="field pl-9" aria-label="Buscar cliente" />
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={18} /> <span className="hidden sm:inline">Agregar cliente</span></button>
      </div>

      {lista.length === 0 ? (
        <EmptyState icon={Users} title="No hay clientes" subtitle="Agrega tu primer cliente al directorio." action={<button className="btn-primary" onClick={openNew}><Plus size={18} /> Agregar cliente</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => {
            const compras = comprasDe(c.id)
            return (
              <div key={c.id} className="card flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={c.nombre} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{c.nombre}</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted">Desde {fmtDate(c.fechaRegistro)}</p>
                  </div>
                  {compras > 0 && (
                    <span className="rounded-pill bg-brand-orange/10 px-2.5 py-1 text-xs font-grotesk font-bold text-brand-orange">
                      {compras} compra{compras === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  {c.telefono && <p className="flex items-center gap-2 text-light-muted dark:text-dark-muted"><Phone size={14} /> {c.telefono}</p>}
                  {c.email && <p className="flex items-center gap-2 text-light-muted dark:text-dark-muted"><Mail size={14} /> {c.email}</p>}
                  {c.nota && <p className="rounded-lg bg-light-bg2 px-2 py-1 text-xs text-light-muted dark:bg-dark-bg dark:text-dark-muted">{c.nota}</p>}
                </div>
                <div className="mt-auto flex gap-1 border-t border-light-border pt-3 dark:border-dark-border">
                  <button className="btn-ghost flex-1 !py-2" onClick={() => navigate(`/facturar?cliente=${c.id}`)}><FileText size={15} /> Facturar</button>
                  <button className="rounded-lg p-2 text-light-muted transition hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => openEdit(c)} aria-label="Editar"><Pencil size={16} /></button>
                  <button className="rounded-lg p-2 text-brand-red transition hover:bg-light-bg2 dark:hover:bg-dark-border" onClick={() => setToDelete(c)} aria-label="Eliminar"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} cliente={editing} />

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Eliminar cliente" size="sm">
        <p className="text-sm text-light-text dark:text-dark-text">¿Eliminar a <strong>{toDelete?.nombre}</strong> del directorio?</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancelar</button>
          <button className="btn-primary !bg-none !bg-brand-red" onClick={() => { deleteCliente(toDelete.id); setToDelete(null) }}>Eliminar</button>
        </div>
      </Modal>
    </PageShell>
  )
}
