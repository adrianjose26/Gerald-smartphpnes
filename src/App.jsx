import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import AppLayout from './components/layout/AppLayout'
import Logo from './components/ui/Logo'

import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Movements from './pages/Movements'
import InvoiceCreate from './pages/InvoiceCreate'
import InvoiceView from './pages/InvoiceView'
import Reports from './pages/Reports'
import Customers from './pages/Customers'
import Settings from './pages/Settings'

export default function App() {
  const ready = useStore((s) => s.ready)
  const init = useStore((s) => s.init)
  const purgeSoldProducts = useStore((s) => s.purgeSoldProducts)

  // Inicializa la base (siembra datos la primera vez) al arrancar.
  useEffect(() => {
    init()
  }, [init])

  // Revisa cada hora si hay productos vendidos con más de 2 días para
  // eliminarlos automáticamente (también se purga al arrancar).
  useEffect(() => {
    const id = setInterval(() => purgeSoldProducts(), 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [purgeSoldProducts])

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-light-bg dark:bg-dark-bg">
        <div className="flex animate-pop flex-col items-center gap-3">
          <Logo variant="mark" />
          <p className="font-display text-sm font-bold text-light-muted dark:text-dark-muted">Cargando inventario…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/movimientos" element={<Movements />} />
        <Route path="/facturar" element={<InvoiceCreate />} />
        <Route path="/facturas/:id" element={<InvoiceView />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/clientes" element={<Customers />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
