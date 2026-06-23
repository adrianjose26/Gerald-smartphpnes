import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingCart, DollarSign, Receipt, Boxes, Trophy } from 'lucide-react'
import { useStore } from '../store/useStore'
import { money, fmtDate } from '../lib/format'
import { movementDelta } from '../lib/stock'
import PageShell from '../components/layout/PageShell'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'

// Clave del mes actual (YYYY-MM)
function mesActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Lista de los últimos 12 meses + "Todo" para filtrar los reportes.
function buildMeses() {
  const out = [{ value: 'todo', label: 'Todo el historial' }]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return out
}

export default function Reports() {
  const facturas = useStore((s) => s.facturas)
  const productos = useStore((s) => s.productos)
  const movimientos = useStore((s) => s.movimientos)
  const productoById = useStore((s) => s.productoById)
  const currency = useStore((s) => s.settings.currency)

  const MESES = useMemo(() => buildMeses(), [])
  const [periodo, setPeriodo] = useState(mesActual())

  // Rango de fechas [desde, hasta) del mes seleccionado.
  const { desde, hasta } = useMemo(() => {
    if (periodo === 'todo') return { desde: 0, hasta: Infinity }
    const [y, mo] = periodo.split('-').map(Number)
    return { desde: new Date(y, mo - 1, 1).getTime(), hasta: new Date(y, mo, 1).getTime() }
  }, [periodo])

  const data = useMemo(() => {
    const enRango = (fecha) => {
      const t = new Date(fecha).getTime()
      return t >= desde && t < hasta
    }
    const facturasRango = facturas.filter((f) => enRango(f.fecha))
    const ventas = facturasRango.reduce((s, f) => s + (f.precio || 0), 0)

    // Costo de lo vendido (según precio de compra del producto ligado)
    const costoVentas = facturasRango.reduce((s, f) => {
      const p = f.productoId ? productoById(f.productoId) : null
      return s + (p?.precioCompra || 0)
    }, 0)
    const ganancia = ventas - costoVentas

    // Compras: entradas de inventario en el rango × precio de compra
    const compras = movimientos
      .filter((mv) => mv.tipo === 'entrada' && enRango(mv.fecha))
      .reduce((s, mv) => {
        const p = productoById(mv.productoId)
        return s + Math.abs(movementDelta(mv)) * (p?.precioCompra || 0)
      }, 0)

    // Más vendidos (por nombre de equipo)
    const conteo = {}
    for (const f of facturasRango) {
      const key = f.equipo || 'Sin nombre'
      if (!conteo[key]) conteo[key] = { nombre: key, unidades: 0, total: 0 }
      conteo[key].unidades++
      conteo[key].total += f.precio || 0
    }
    const masVendidos = Object.values(conteo).sort((a, b) => b.unidades - a.unidades || b.total - a.total).slice(0, 6)

    // Valor del inventario actual (productos disponibles, 1 unidad c/u)
    const valorInventario = productos
      .filter((p) => p.estado !== 'vendido')
      .reduce((s, p) => s + p.precioVenta, 0)

    return { facturasRango, ventas, costoVentas, ganancia, compras, masVendidos, valorInventario, count: facturasRango.length }
  }, [facturas, productos, movimientos, desde, hasta]) // eslint-disable-line

  const margen = data.ventas > 0 ? Math.round((data.ganancia / data.ventas) * 100) : 0

  return (
    <PageShell title="Reportes" subtitle="Ventas, compras y ganancia">
      {/* Selector de mes */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-grotesk font-bold text-light-muted dark:text-dark-muted">Mes:</span>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="field w-auto"
          aria-label="Filtrar por mes"
        >
          {MESES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Ventas" value={money(data.ventas, currency)} color="#16A34A" progress={80} hint={`${data.count} factura${data.count === 1 ? '' : 's'}`} />
        <StatCard icon={ShoppingCart} label="Compras" value={money(data.compras, currency)} color="#FF6A00" progress={55} hint="Entradas de inventario" />
        <StatCard icon={DollarSign} label="Ganancia" value={money(data.ganancia, currency)} color="#06B6D4" progress={Math.max(0, margen)} hint={`Margen ${margen}%`} />
        <StatCard icon={Boxes} label="Valor del inventario" value={money(data.valorInventario, currency)} color="#7C5CFC" progress={70} hint="Existencias actuales" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Productos más vendidos */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-brand-yellow" />
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Más vendidos</h3>
          </div>
          {data.masVendidos.length === 0 ? (
            <p className="py-8 text-center text-sm text-light-muted dark:text-dark-muted">Sin ventas en este período.</p>
          ) : (
            <ul className="space-y-2">
              {data.masVendidos.map((item, i) => (
                <li key={item.nombre} className="flex items-center gap-3 rounded-xl border border-light-border p-3 dark:border-dark-border">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-sm font-display font-extrabold text-white dark:bg-brand-gradient-premium">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{item.nombre}</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted">{item.unidades} unidad{item.unidades === 1 ? '' : 'es'}</p>
                  </div>
                  <span className="font-display font-extrabold text-light-text dark:text-dark-text">{money(item.total, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Facturas del período */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-brand-cyan" />
            <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Facturas del período</h3>
          </div>
          {data.facturasRango.length === 0 ? (
            <EmptyState icon={Receipt} title="Sin facturas" subtitle="No se emitieron facturas en este período." />
          ) : (
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {data.facturasRango.slice(0, 8).map((f) => (
                <li key={f.id}>
                  <Link to={`/facturas/${f.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate font-grotesk font-bold text-light-text dark:text-dark-text">{f.equipo}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted">{f.numero} · {f.clienteNombre} · {fmtDate(f.fecha)}</p>
                    </div>
                    <span className="font-display font-extrabold text-stock-ok">{money(f.precio, currency)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  )
}
