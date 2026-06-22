import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, Users, ArrowLeftRight } from 'lucide-react'

// Navegación inferior en móvil (mobile-first).
const NAV = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/facturar', label: 'Facturar', icon: FileText, primary: true },
  { to: '/movimientos', label: 'Movim.', icon: ArrowLeftRight },
  { to: '/clientes', label: 'Clientes', icon: Users },
]

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-light-border bg-light-surface/95 backdrop-blur dark:border-dark-border dark:bg-dark-surface/95 lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ to, label, icon: Icon, end, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-grotesk font-bold transition ${
                isActive ? 'text-brand-orange' : 'text-light-muted dark:text-dark-muted'
              }`
            }
          >
            {primary ? (
              <span className="grid h-11 w-11 -translate-y-3 place-items-center rounded-2xl bg-brand-gradient text-white shadow-soft dark:bg-brand-gradient-premium">
                <Icon size={22} />
              </span>
            ) : (
              <Icon size={22} />
            )}
            <span className={primary ? '-mt-2' : ''}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
