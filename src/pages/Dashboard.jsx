import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Boxes, PackageCheck, Plus, ChevronDown, FileText, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { money } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import StatCard from '../components/ui/StatCard'
import ProductThumb from '../components/ui/ProductThumb'
import ProductForm from '../components/ProductForm'

export default function Dashboard() {
  const productos = useStore((s) => s.productos)
  const categorias = useStore((s) => s.categorias)
  const categoriaById = useStore((s) => s.categoriaById)
  const currency = useStore((s) => s.settings.currency)
  const navigate = useNavigate()

  const [prodOpen, setProdOpen] = useState(false)

  // Métricas (cada producto = 1 unidad; disponible si no está vendido)
  const m = useMemo(() => {
    let valor = 0
    let disponibles = 0
    let vendidos = 0
    const porCat = {}
    for (const p of productos) {
      if (p.estado !== 'vendido') {
        disponibles++
        valor += p.precioVenta
      } else {
        vendidos++
      }
      porCat[p.categoriaId] = (porCat[p.categoriaId] || 0) + 1
    }
    return { valor, disponibles, vendidos, porCat }
  }, [productos])

  const total = productos.length || 1
  const maxCat = Math.max(1, ...Object.values(m.porCat))

  // Lista de artículos disponibles (más recientes primero)
  const disponiblesList = useMemo(
    () => productos.filter((p) => p.estado !== 'vendido').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [productos]
  )

  const acciones = (
    <div className="flex items-center justify-between gap-3">
      <p className="hidden text-sm text-light-muted dark:text-dark-muted sm:block">Resumen general del inventario</p>
      {/* Botón Agregar con menú desplegable */}
      <details className="group relative ml-auto">
        <summary className="btn-primary cursor-pointer list-none">
          <Plus size={18} /> Agregar producto <ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-card border border-light-border bg-light-surface shadow-card dark:border-dark-border dark:bg-dark-surface">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-light-text transition hover:bg-light-bg2 dark:text-dark-text dark:hover:bg-dark-border" onClick={(e) => { e.currentTarget.closest('details').open = false; setProdOpen(true) }}>
            <Package size={17} className="text-brand-orange" /> Nuevo producto
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-light-text transition hover:bg-light-bg2 dark:text-dark-text dark:hover:bg-dark-border" onClick={(e) => { e.currentTarget.closest('details').open = false; navigate('/facturar') }}>
            <FileText size={17} className="text-brand-cyan" /> Generar factura
          </button>
        </div>
      </details>
    </div>
  )

  return (
    <PageShell title="Inventario" subtitle="Resumen general" withDirectory actions={acciones}>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard icon={PackageCheck} label="Disponibles" value={m.disponibles} color="#16A34A" progress={(m.disponibles / total) * 100} hint="Listos para vender" />
        <StatCard icon={Boxes} label="Valor del inventario" value={money(m.valor, currency)} color="#FF6A00" progress={70} hint="Disponibles a precio de venta" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Productos por categoría */}
        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-light-text dark:text-dark-text">Productos por categoría</h3>
          <div className="space-y-3">
            {categorias.map((c) => {
              const n = m.porCat[c.id] || 0
              return (
                <button key={c.id} onClick={() => navigate(`/productos?cat=${c.id}`)} className="block w-full text-left">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-grotesk font-bold text-light-text dark:text-dark-text">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" /> {c.nombre}
                    </span>
                    <span className="text-light-muted dark:text-dark-muted">{n}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-pill bg-light-bg2 dark:bg-dark-border">
                    <div className="h-full rounded-pill bg-brand-gradient transition-all dark:bg-brand-gradient-premium" style={{ width: `${(n / maxCat) * 100}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Artículos disponibles */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Artículos disponibles</h3>
            <Link to="/productos" className="text-xs font-grotesk font-bold text-brand-orange hover:underline">Ver productos</Link>
          </div>
          {disponiblesList.length === 0 ? (
            <p className="py-8 text-center text-sm text-light-muted dark:text-dark-muted">No hay artículos disponibles.</p>
          ) : (
            <ul className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {disponiblesList.map((p) => {
                const c = categoriaById(p.categoriaId)
                return (
                  <li key={p.id}>
                    <Link to={`/productos/${p.id}`} className="flex items-center gap-3 overflow-hidden rounded-xl border border-light-border p-2.5 transition hover:bg-light-bg2 dark:border-dark-border dark:hover:bg-dark-border">
                      {/* barra verde de "disponible" */}
                      <span className="h-9 w-1.5 shrink-0 rounded-full bg-stock-ok" />
                      <ProductThumb producto={p} categoria={c} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{p.nombre}</p>
                        <p className="truncate text-xs text-light-muted dark:text-dark-muted">{c?.nombre || 'Sin categoría'} · Tipo {p.tipo || 'A'}</p>
                      </div>
                      <span className="font-display font-extrabold text-light-text dark:text-dark-text">{money(p.precioVenta, currency)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Directorio en móvil (debajo del contenido) */}
      <div className="mt-5 xl:hidden">
        <MobileDirectory />
      </div>

      <ProductForm open={prodOpen} onClose={() => setProdOpen(false)} />
    </PageShell>
  )
}

// En móvil mostramos un acceso compacto al directorio.
function MobileDirectory() {
  const clientes = useStore((s) => s.clientes)
  return (
    <Link to="/clientes" className="card flex items-center justify-between p-5">
      <div>
        <p className="text-xs font-grotesk font-bold uppercase tracking-wide text-light-muted dark:text-dark-muted">Directorio</p>
        <p className="font-display text-2xl font-extrabold text-light-text dark:text-dark-text">{clientes.length} clientes</p>
      </div>
      <span className="btn-primary !px-3">Ver todos <ChevronRight size={16} /></span>
    </Link>
  )
}
