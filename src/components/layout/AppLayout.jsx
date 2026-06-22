import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Toast from '../ui/Toast'

// Estructura general de la app: barra lateral (escritorio) + contenido +
// navegación inferior (móvil) + toasts.
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Toast />
    </div>
  )
}
