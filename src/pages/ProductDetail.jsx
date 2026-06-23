import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, ArrowDownToLine, ArrowUpFromLine, FileText } from 'lucide-react'
import { useStore } from '../store/useStore'
import { productBadge, isDisponible, COND_LABEL, cantidadDe } from '../lib/stock'
import { money, fmtDateTime } from '../lib/format'
import PageShell from '../components/layout/PageShell'
import ProductThumb from '../components/ui/ProductThumb'
import CategoryPill from '../components/ui/CategoryPill'
import Badge from '../components/ui/Badge'
import ProductForm from '../components/ProductForm'
import EmptyState from '../components/ui/EmptyState'

// Iconos del historial (alta / venta)
const TIPO_META = {
  entrada: { icon: ArrowDownToLine, color: '#16A34A' },
  salida: { icon: ArrowUpFromLine, color: '#E11D48' },
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const producto = useStore((s) => s.productoById(id))
  const categoriaById = useStore((s) => s.categoriaById)
  const movimientosDe = useStore((s) => s.movimientosDe)
  const currency = useStore((s) => s.settings.currency)

  const [editOpen, setEditOpen] = useState(false)

  if (!producto) {
    return (
      <PageShell title="Producto" subtitle="Detalle">
        <EmptyState icon={FileText} title="Producto no encontrado" action={<Link to="/productos" className="btn-primary">Volver a productos</Link>} />
      </PageShell>
    )
  }

  const c = categoriaById(producto.categoriaId)
  const st = productBadge(producto)
  const disponible = isDisponible(producto)
  const movs = movimientosDe(producto.id)
  const datosEquipo = [
    ['Capacidad', producto.capacidad],
    ['IMEI / Serial', producto.imei],
    ['Red', producto.red],
  ].filter(([, v]) => v)

  const cant = cantidadDe(producto)
  const ganancia = producto.precioVenta - producto.precioCompra

  return (
    <PageShell title={producto.nombre} subtitle={`SKU ${producto.sku}`}>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-grotesk font-bold text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <div className="flex flex-wrap items-start gap-4">
              <ProductThumb producto={producto} categoria={c} size={84} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryPill categoria={c} />
                  <Badge state={st} />
                </div>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-light-text dark:text-dark-text">{producto.nombre}</h2>
                <p className="text-sm text-light-muted dark:text-dark-muted">{producto.compradorNombre ? `Comprado por: ${producto.compradorNombre}` : 'Sin comprador asignado'}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEditOpen(true)}><Pencil size={16} /> Editar</button>
                {disponible && (
                  <button className="btn-primary" onClick={() => navigate(`/facturar?producto=${producto.id}`)}><FileText size={16} /> Facturar</button>
                )}
              </div>
            </div>

            {/* Métricas */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Condición" value={COND_LABEL[producto.nuevoUsado] || 'Nuevo'} color={st.color} />
              <Metric label="Cantidad" value={`${cant} ${cant === 1 ? 'unidad' : 'unidades'}`} color={disponible ? '#16A34A' : '#1F2735'} />
              <Metric label="Precio venta" value={money(producto.precioVenta, currency)} />
              <Metric label="Precio compra" value={money(producto.precioCompra, currency)} />
            </div>

            {datosEquipo.length > 0 && (
              <div className="mt-5 border-t border-light-border pt-4 dark:border-dark-border">
                <h3 className="mb-3 font-display text-sm font-bold text-light-text dark:text-dark-text">Datos del equipo</h3>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {datosEquipo.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-light-muted dark:text-dark-muted">{k}</dt>
                      <dd className="font-grotesk font-bold text-light-text dark:text-dark-text">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="card p-5">
            <h3 className="mb-4 font-display text-lg font-bold text-light-text dark:text-dark-text">Historial</h3>
            {movs.length === 0 ? (
              <p className="py-6 text-center text-sm text-light-muted dark:text-dark-muted">Sin actividad todavía.</p>
            ) : (
              <ul className="space-y-2">
                {movs.map((m) => {
                  const meta = TIPO_META[m.tipo] || TIPO_META.entrada
                  return (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl border border-light-border p-3 dark:border-dark-border">
                      <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                        <meta.icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-grotesk font-bold text-light-text dark:text-dark-text">{m.motivo || (m.tipo === 'salida' ? 'Venta' : 'Alta')}</p>
                        <p className="text-xs text-light-muted dark:text-dark-muted">{fmtDateTime(m.fecha)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Columna lateral: valor */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-sm font-bold text-light-text dark:text-dark-text">Valor en inventario</h3>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand-orange">{money(cant * producto.precioVenta, currency)}</p>
            <p className="mt-1 text-sm text-light-muted dark:text-dark-muted">{cant} × {money(producto.precioVenta, currency)}</p>
            <div className="mt-4 space-y-2 border-t border-light-border pt-4 text-sm dark:border-dark-border">
              <Row label="Inversión (costo)" value={money(cant * producto.precioCompra, currency)} />
              <Row label="Ganancia" value={money(cant * ganancia, currency)} accent />
            </div>
          </div>
        </div>
      </div>

      <ProductForm open={editOpen} onClose={() => setEditOpen(false)} producto={producto} />
    </PageShell>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="rounded-xl bg-light-bg2 p-3 dark:bg-dark-bg">
      <p className="text-xs text-light-muted dark:text-dark-muted">{label}</p>
      <p className="font-display text-lg font-extrabold" style={{ color: color || undefined }}>{value}</p>
    </div>
  )
}
function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-light-muted dark:text-dark-muted">{label}</span>
      <span className={`font-semibold ${accent ? 'text-stock-ok' : 'text-light-text dark:text-dark-text'}`}>{value}</span>
    </div>
  )
}
