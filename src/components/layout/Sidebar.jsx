import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ArrowLeftRight, FileText, BarChart3, Users, Settings, Plus, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Logo from '../ui/Logo'

// Navegación de escritorio: barra lateral oscura con degradado.
const NAV = [
  { to: '/', label: 'Inventario', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/facturar', label: 'Generar factura', icon: FileText },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar-gradient p-4 text-white lg:flex">
      <div className="px-2 py-3">
        <Logo light />
      </div>

      <NavLink to="/facturar" className="btn-primary mt-2 w-full">
        <Plus size={18} /> Nueva factura
      </NavLink>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-grotesk font-bold transition ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-card bg-white/5 p-4 ring-1 ring-white/10">
        <p className="font-display text-sm font-bold">¿Necesitas ayuda?</p>
        <p className="mt-1 text-xs text-white/60">Contáctanos al 809-986-1389</p>
        <p className="mt-2 text-[11px] font-grotesk font-bold tracking-widest text-brand-orange">
          @VENTURASMARTPHONE
        </p>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-grotesk font-bold text-white/65 transition hover:bg-white/5 hover:text-white"
      >
        <LogOut size={19} /> Cerrar sesión
      </button>
    </aside>
  )
}
