import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import AppLayout from './components/layout/AppLayout'
import Logo from './components/ui/Logo'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Movements from './pages/Movements'
import InvoiceCreate from './pages/InvoiceCreate'
import InvoiceView from './pages/InvoiceView'
import Reports from './pages/Reports'
import Customers from './pages/Customers'
import Settings from './pages/Settings'

function Splash({ texto }) {
  return (
    <div className="grid min-h-screen place-items-center bg-light-bg dark:bg-dark-bg">
      <div className="flex animate-pop flex-col items-center gap-3">
        <Logo variant="mark" size={56} />
        <p className="font-display text-sm font-bold text-light-muted dark:text-dark-muted">{texto}</p>
      </div>
    </div>
  )
}

export default function App() {
  const ready = useStore((s) => s.ready)
  const init = useStore((s) => s.init)
  const reload = useStore((s) => s.reload)
  const resetState = useStore((s) => s.resetState)
  const purgeSoldProducts = useStore((s) => s.purgeSoldProducts)

  // session: undefined = cargando, null = sin sesión, objeto = con sesión
  const [session, setSession] = useState(undefined)

  // Escucha el estado de autenticación de Supabase.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Carga los datos al iniciar sesión; limpia el estado al cerrarla.
  useEffect(() => {
    if (session) {
      if (!useStore.getState().ready) init()
    } else if (session === null) {
      resetState()
    }
  }, [session, init, resetState])

  // Sincroniza entre dispositivos: recarga los datos al volver a la app.
  useEffect(() => {
    if (!session) return
    const onVisible = () => { if (document.visibilityState === 'visible') reload() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [session, reload])

  // Limpia los vendidos vencidos cada hora.
  useEffect(() => {
    if (!session) return
    const id = setInterval(() => purgeSoldProducts(), 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [session, purgeSoldProducts])

  if (session === undefined) return <Splash texto="Cargando…" />
  if (session === null) return <Login />
  if (!ready) return <Splash texto="Cargando inventario…" />

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
