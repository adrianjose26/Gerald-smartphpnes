import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Plus, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import Avatar from '../ui/Avatar'
import Logo from '../ui/Logo'
import CustomerForm from '../CustomerForm'

// Panel de Directorio de clientes (fijo a la derecha en escritorio,
// pestaña propia en móvil).
export default function Directory() {
  const clientes = useStore((s) => s.clientes)
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)

  const recientes = [...clientes]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      {/* Clientes registrados */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between bg-brand-gradient px-5 py-4 text-white dark:bg-brand-gradient-premium">
          <div>
            <p className="text-xs font-grotesk font-bold uppercase tracking-wide text-white/80">Clientes registrados</p>
            <p className="font-display text-3xl font-extrabold">{clientes.length}</p>
          </div>
          <Users size={34} className="text-white/80" />
        </div>
        <Link
          to="/clientes"
          className="flex items-center justify-between px-5 py-3 text-sm font-grotesk font-bold text-light-text transition hover:bg-light-bg2 dark:text-dark-text dark:hover:bg-dark-border"
        >
          Ver todos los clientes
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Clientes recientes */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Clientes recientes</h3>
          <Link to="/clientes" className="text-xs font-grotesk font-bold text-brand-orange hover:underline">
            Ver todos
          </Link>
        </div>

        <ul className="space-y-1">
          {recientes.map((c) => (
            <li key={c.id}>
              <Link
                to="/clientes"
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-light-bg2 dark:hover:bg-dark-border"
              >
                <Avatar name={c.nombre} size={38} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-light-text dark:text-dark-text">{c.nombre}</p>
                  <p className="truncate text-xs text-light-muted dark:text-dark-muted">{c.telefono || 'Sin teléfono'}</p>
                </div>
              </Link>
            </li>
          ))}
          {recientes.length === 0 && (
            <li className="py-4 text-center text-sm text-light-muted dark:text-dark-muted">Aún no hay clientes</li>
          )}
        </ul>

        <button className="btn-ghost mt-3 w-full" onClick={() => setFormOpen(true)}>
          <Plus size={17} /> Agregar cliente
        </button>
      </div>

      {/* Tarjeta promocional */}
      <div className="card relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-gradient opacity-20 blur-xl dark:bg-brand-gradient-premium" />
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white dark:bg-brand-gradient-premium">
          <TrendingUp size={20} />
        </span>
        <h3 className="mt-3 font-display text-base font-extrabold text-light-text dark:text-dark-text">
          Lleva tu inventario al siguiente nivel
        </h3>
        <p className="mt-1 text-sm text-light-muted dark:text-dark-muted">
          Consulta reportes, estadísticas y mejora tus ventas.
        </p>
        <button className="btn-primary mt-3 w-full" onClick={() => navigate('/reportes')}>
          Ver reportes
        </button>
      </div>

      {/* Pie con wordmark */}
      <div className="flex flex-col items-center gap-1 py-2 text-center">
        <Logo variant="wordmark" className="items-center" />
        <p className="text-[11px] text-light-muted dark:text-dark-muted">809.986.1389</p>
      </div>

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
