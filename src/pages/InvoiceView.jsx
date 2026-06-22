import { useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Send, Printer, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { invoiceToPdf } from '../lib/pdf'
import { enviarFacturaPorWhatsApp } from '../lib/sendInvoice'
import PageShell from '../components/layout/PageShell'
import InvoiceDocument from '../components/InvoiceDocument'
import EmptyState from '../components/ui/EmptyState'

export default function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const factura = useStore((s) => s.facturas.find((f) => f.id === id))
  const currency = useStore((s) => s.settings.currency)
  const notify = useStore((s) => s.notify)
  const ref = useRef(null)
  const [sending, setSending] = useState(false)

  if (!factura) {
    return (
      <PageShell title="Factura" subtitle="Documento">
        <EmptyState icon={FileText} title="Factura no encontrada" action={<Link to="/" className="btn-primary">Ir al inicio</Link>} />
      </PageShell>
    )
  }

  const descargar = () => invoiceToPdf(ref.current, `Factura-${factura.numero}.pdf`)
  const enviar = async () => {
    if (sending) return
    setSending(true)
    try {
      const metodo = await enviarFacturaPorWhatsApp(ref.current, factura, currency)
      if (metodo === 'fallback') notify('PDF descargado · adjúntalo en el chat de WhatsApp', 'info')
    } catch (e) {
      console.error(e)
      notify('No se pudo preparar el PDF', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageShell title={`Factura ${factura.numero}`} subtitle={`Emitida a ${factura.clienteNombre}`}>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-grotesk font-bold text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Confirmación */}
      <div className="mb-5 flex items-center gap-3 rounded-card border border-stock-ok/30 bg-stock-ok/10 p-4">
        <CheckCircle2 className="shrink-0 text-stock-ok" size={22} />
        <p className="text-sm font-medium text-light-text dark:text-dark-text">
          Factura generada · <strong>{factura.equipo}</strong> vendido a <strong>{factura.clienteNombre}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        {/* Documento */}
        <div className="print-area">
          <InvoiceDocument ref={ref} invoice={factura} currency={currency} />
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 lg:w-56 print:hidden">
          <button className="btn-primary w-full" onClick={enviar} disabled={sending}>
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {sending ? 'Preparando PDF…' : 'Enviar por WhatsApp'}
          </button>
          <button className="btn-ghost w-full" onClick={descargar}><Download size={18} /> Descargar PDF</button>
          <button className="btn-ghost w-full" onClick={() => window.print()}><Printer size={18} /> Imprimir</button>
          <Link to="/facturar" className="btn-ghost w-full"><FileText size={18} /> Nueva factura</Link>
        </div>
      </div>
    </PageShell>
  )
}
