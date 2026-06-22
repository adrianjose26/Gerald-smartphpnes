import { useNavigate } from 'react-router-dom'
import { Search, Moon, Sun } from 'lucide-react'
import { useStore } from '../../store/useStore'
import Logo from '../ui/Logo'

// Cabecera superior: en móvil muestra el logo; siempre ofrece buscador
// (que navega a Productos) y conmutador de tema.
export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate()
  const theme = useStore((s) => s.settings.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-light-border bg-light-bg/80 px-4 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-bg/80 lg:px-8">
      {/* Logo solo en móvil/tablet (en escritorio ya está en el sidebar) */}
      <div className="lg:hidden">
        <Logo variant="mark" />
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-extrabold text-light-text dark:text-dark-text lg:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="truncate text-xs text-light-muted dark:text-dark-muted lg:text-sm">{subtitle}</p>}
      </div>

      {/* Buscador (lleva a Productos) */}
      <form
        className="relative hidden sm:block"
        onSubmit={(e) => {
          e.preventDefault()
          const q = new FormData(e.currentTarget).get('q')
          navigate(`/productos?q=${encodeURIComponent(q || '')}`)
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={17} />
        <input
          name="q"
          placeholder="Buscar producto…"
          aria-label="Buscar producto"
          className="field w-44 pl-9 lg:w-64"
        />
      </form>

      <button
        onClick={toggleTheme}
        className="btn-ghost !px-2.5"
        aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        title="Cambiar tema"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
