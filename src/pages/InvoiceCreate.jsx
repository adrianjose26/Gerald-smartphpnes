import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, Download, UserX, Eye, Loader2, CalendarDays } from 'lucide-react'
import { useStore } from '../store/useStore'
import { NOTA_DEFAULT, GARANTIA_DEFAULT } from '../lib/invoiceText'
import { invoiceToPdf } from '../lib/pdf'
import { enviarFacturaPorWhatsApp } from '../lib/sendInvoice'
import PageShell from '../components/layout/PageShell'
import InvoiceDocument from '../components/InvoiceDocument'
import SearchableSelect from '../components/ui/SearchableSelect'
import RedSelect from '../components/ui/RedSelect'

// Fecha de hoy en formato del input date (YYYY-MM-DD)
const hoy = () => new Date().toISOString().slice(0, 10)
// Convierte 'YYYY-MM-DD' a ISO (mediodía local para evitar saltos de día)
const toISO = (d) => (d ? new Date(d + 'T12:00:00').toISOString() : new Date().toISOString())

export default function InvoiceCreate() {
  const productos = useStore((s) => s.productos)
  const clientes = useStore((s) => s.clientes)
  const productoById = useStore((s) => s.productoById)
  const clienteById = useStore((s) => s.clienteById)
  const generarFactura = useStore((s) => s.generarFactura)
  const notify = useStore((s) => s.notify)
  const currency = useStore((s) => s.settings.currency)

  const [params] = useSearchParams()
  const navigate = useNavigate()
  const previewRef = useRef(null)

  // Estado del borrador de factura
  const [form, setForm] = useState({
    productoId: '',
    clienteId: '',
    generico: false,
    clienteNombre: '',
    clienteTelefono: '',
    equipo: '',
    capacidad: '',
    imei: '',
    red: '',
    precio: '',
    fecha: hoy(),
    nota: NOTA_DEFAULT,
    garantia: GARANTIA_DEFAULT,
  })
  const [committed, setCommitted] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Productos que aún se pueden vender (no vendidos).
  const disponibles = useMemo(() => productos.filter((p) => p.estado !== 'vendido'), [productos])

  // Pre-selección desde la URL (?producto= o ?cliente=)
  useEffect(() => {
    const pid = params.get('producto')
    const cid = params.get('cliente')
    if (pid) onProducto(pid)
    if (cid) onCliente(cid)
    // eslint-disable-next-line
  }, [])

  // Autocompletar por producto
  function onProducto(pid) {
    const p = productoById(pid)
    if (!p) { set('productoId', ''); return }
    setForm((f) => ({
      ...f,
      productoId: pid,
      equipo: p.nombre,
      capacidad: p.capacidad || '',
      imei: p.imei || '',
      red: p.red || '',
      precio: p.precioVenta || '',
    }))
  }

  // Autocompletar por cliente
  function onCliente(cid) {
    const c = clienteById(cid)
    setForm((f) => ({
      ...f,
      clienteId: cid,
      generico: false,
      clienteNombre: c?.nombre || '',
      clienteTelefono: c?.telefono || '',
    }))
  }

  function toggleGenerico(on) {
    setForm((f) => ({
      ...f,
      generico: on,
      clienteId: on ? '' : f.clienteId,
      clienteNombre: on ? 'Cliente genérico' : '',
      clienteTelefono: on ? '' : f.clienteTelefono,
    }))
  }

  // Objeto que alimenta la vista previa (o la factura ya emitida)
  const previewInvoice = committed || {
    numero: 'Borrador',
    fecha: toISO(form.fecha),
    clienteNombre: form.generico ? 'Cliente genérico' : form.clienteNombre,
    equipo: form.equipo,
    capacidad: form.capacidad,
    imei: form.imei,
    red: form.red,
    precio: Number(form.precio) || 0,
    nota: form.nota,
    garantia: form.garantia,
  }

  function validar() {
    if (!form.equipo.trim()) { notify('Indica el equipo a facturar', 'warning'); return false }
    if (!(Number(form.precio) > 0)) { notify('Indica el precio de venta', 'warning'); return false }
    if (!form.generico && !form.clienteNombre.trim()) { notify('Elige un cliente o activa "Cliente genérico"', 'warning'); return false }
    return true
  }

  async function emitir(action) {
    if (busy || committed) return
    if (!validar()) return
    setBusy(true)

    // 1) Emitir la factura (marca el equipo como vendido, registra la salida…)
    const factura = generarFactura({
      productoId: form.productoId || null,
      clienteId: form.generico ? null : form.clienteId || null,
      clienteNombre: form.generico ? 'Cliente genérico' : form.clienteNombre,
      clienteTelefono: form.clienteTelefono,
      equipo: form.equipo,
      capacidad: form.capacidad,
      imei: form.imei,
      red: form.red,
      precio: Number(form.precio) || 0,
      fecha: toISO(form.fecha),
      nota: form.nota,
      garantia: form.garantia,
    })
    // 2) Mostrar el documento definitivo (con número) en la vista previa
    setCommitted(factura)
    // 3) Esperar a que el DOM pinte la factura definitiva antes de capturarla
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    try {
      if (action === 'send') {
        const metodo = await enviarFacturaPorWhatsApp(previewRef.current, factura, currency)
        if (metodo === 'fallback') {
          notify('PDF descargado · adjúntalo en el chat de WhatsApp', 'info')
        }
      } else {
        await invoiceToPdf(previewRef.current, `Factura-${factura.numero}.pdf`)
      }
    } catch (e) {
      console.error(e)
      notify('No se pudo generar el PDF', 'error')
    }
    navigate(`/facturas/${factura.id}`)
  }

  return (
    <PageShell title="Generar factura" subtitle="Editor con vista previa en vivo">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ============ EDITOR ============ */}
        <div className="space-y-5">
          {/* Fecha de la factura */}
          <section className="card p-5">
            <h3 className="mb-3 font-display text-base font-bold text-light-text dark:text-dark-text">Fecha de la factura</h3>
            <div className="flex items-center gap-2">
              <input id="i-fecha" type="date" className="field" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} />
              <button type="button" className="btn-ghost shrink-0" onClick={() => set('fecha', hoy())}>
                <CalendarDays size={16} /> Hoy
              </button>
            </div>
            <p className="mt-1.5 text-xs text-light-muted dark:text-dark-muted">Por defecto es hoy; puedes cambiarla si la venta fue otro día.</p>
          </section>

          {/* Producto */}
          <section className="card p-5">
            <h3 className="mb-3 font-display text-base font-bold text-light-text dark:text-dark-text">Producto del inventario</h3>
            <label className="label" htmlFor="i-prod">Elegir producto (autocompleta los datos)</label>
            <select id="i-prod" className="field" value={form.productoId} onChange={(e) => onProducto(e.target.value)}>
              <option value="">— Venta manual / sin inventario —</option>
              {disponibles.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}{p.capacidad ? ` · ${p.capacidad}` : ''}</option>
              ))}
            </select>
          </section>

          {/* Cliente */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-light-text dark:text-dark-text">Cliente</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-grotesk font-bold text-light-muted dark:text-dark-muted">
                <UserX size={16} /> Cliente genérico
                <input type="checkbox" className="peer sr-only" checked={form.generico} onChange={(e) => toggleGenerico(e.target.checked)} />
                <span className="relative h-6 w-11 rounded-full bg-light-border transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:bg-brand-orange peer-checked:after:translate-x-5 dark:bg-dark-border" />
              </label>
            </div>

            {!form.generico && (
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="i-cli">Elegir del directorio</label>
                  <SearchableSelect
                    id="i-cli"
                    value={form.clienteId}
                    onChange={(v) => (v ? onCliente(v) : setForm((f) => ({ ...f, clienteId: '', clienteNombre: '', clienteTelefono: '' })))}
                    placeholder="Buscar cliente…"
                    options={[
                      { value: '', label: '— Sin seleccionar —' },
                      ...clientes.map((c) => ({ value: c.id, label: c.nombre, sublabel: c.telefono })),
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="i-cli-nom">Nombre del cliente</label>
                    <input id="i-cli-nom" className="field" value={form.clienteNombre} onChange={(e) => set('clienteNombre', e.target.value)} />
                  </div>
                  <div>
                    <label className="label" htmlFor="i-cli-tel">Teléfono (para WhatsApp)</label>
                    <input id="i-cli-tel" className="field" value={form.clienteTelefono} onChange={(e) => set('clienteTelefono', e.target.value)} placeholder="+1 809-000-0000" inputMode="tel" />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Datos del equipo */}
          <section className="card p-5">
            <h3 className="mb-3 font-display text-base font-bold text-light-text dark:text-dark-text">Datos del equipo</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="i-equipo">Equipo *</label>
                <input id="i-equipo" className="field" value={form.equipo} onChange={(e) => set('equipo', e.target.value)} placeholder="iPhone 15 Pro Max" />
              </div>
              <div>
                <label className="label" htmlFor="i-cap">Capacidad</label>
                <input id="i-cap" className="field" value={form.capacidad} onChange={(e) => set('capacidad', e.target.value)} placeholder="256GB" />
              </div>
              <div>
                <label className="label" htmlFor="i-precio">Precio *</label>
                <input id="i-precio" type="number" min="0" step="0.01" className="field" value={form.precio} onChange={(e) => set('precio', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="i-red">Red</label>
                <RedSelect id="i-red" value={form.red} onChange={(v) => set('red', v)} />
              </div>
              <div>
                <label className="label" htmlFor="i-imei">IMEI / Serial</label>
                <input id="i-imei" className="field" value={form.imei} onChange={(e) => set('imei', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Nota y garantía */}
          <section className="card p-5">
            <h3 className="mb-3 font-display text-base font-bold text-light-text dark:text-dark-text">Nota y garantía</h3>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="i-nota">Nota (editable)</label>
                <textarea id="i-nota" className="field" rows={4} value={form.nota} onChange={(e) => set('nota', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="i-gar">Garantía (editable)</label>
                <textarea id="i-gar" className="field" rows={4} value={form.garantia} onChange={(e) => set('garantia', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div className="sticky bottom-20 z-10 flex gap-2 lg:bottom-4">
            <button className="btn-primary flex-1" disabled={busy} onClick={() => emitir('send')}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {busy ? 'Generando…' : 'Generar y enviar'}
            </button>
            <button className="btn-ghost flex-1" disabled={busy} onClick={() => emitir('download')}>
              <Download size={18} /> Descargar PDF
            </button>
          </div>
        </div>

        {/* ============ VISTA PREVIA ============ */}
        <div>
          <div className="sticky top-20">
            <div className="mb-2 flex items-center gap-2 text-sm font-grotesk font-bold text-light-muted dark:text-dark-muted">
              <Eye size={16} /> Vista previa en vivo
            </div>
            <InvoiceDocument ref={previewRef} invoice={previewInvoice} currency={currency} />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
