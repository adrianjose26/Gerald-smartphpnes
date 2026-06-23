import { forwardRef } from 'react'
import { money, fmtInvoiceDate } from '../lib/format'
import { NEGOCIO } from '../lib/invoiceText'

// Documento de factura imprimible / capturable a PDF.
// Siempre se renderiza en "papel blanco" (independiente del tema)
// para que el PDF se vea consistente. Usa colores sólidos (hex) que
// html2canvas captura sin problemas.
const NAVY = '#1E2A52'
const TEXT = '#131820'
const MUTED = '#687284'

const Field = ({ label, value }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ fontSize: 10, letterSpacing: '0.12em', fontWeight: 700, color: NAVY, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, wordBreak: 'break-word' }}>{value || '—'}</div>
  </div>
)

const InvoiceDocument = forwardRef(function InvoiceDocument({ invoice, currency = 'DOP' }, ref) {
  const inv = invoice || {}
  return (
    <div
      ref={ref}
      style={{
        background: '#ffffff', color: TEXT, width: '100%', maxWidth: 720, margin: '0 auto',
        borderLeft: `8px solid ${NAVY}`, borderRadius: 8, overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 6px 24px -12px rgba(19,24,32,0.25)',
      }}
    >
      <div style={{ padding: '28px 32px' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', fontWeight: 800, color: NAVY }}>FACTURA DE VENTA</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', fontWeight: 700, color: MUTED }}>FECHA</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{fmtInvoiceDate(inv.fecha)}</div>
          </div>
        </div>

        {/* Logo real de la tienda, centrado */}
        <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
          <img
            src="/logo.png"
            alt="Ventura Smart Phone"
            crossOrigin="anonymous"
            style={{ width: 116, height: 116, objectFit: 'contain', display: 'inline-block' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {inv.numero && <div style={{ marginTop: 2, fontSize: 12, color: MUTED }}>No. {inv.numero}</div>}
        </div>

        {/* Campos en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 8 }}>
          <Field label="Cliente" value={inv.clienteNombre} />
          <Field label="Equipo" value={inv.equipo} />
          <Field label="Precio" value={inv.precio != null ? money(inv.precio, currency) : ''} />
          <Field label="Capacidad" value={inv.capacidad} />
          <Field label="Red" value={inv.red} />
          <Field label="IMEI · Serial" value={inv.imei} />
        </div>

        {/* Separador */}
        <div style={{ margin: '22px 0', borderTop: '1px solid #E6EAF0' }} />

        {/* Nota */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 800, color: NAVY, marginBottom: 4 }}>NOTA</div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: TEXT, margin: 0, whiteSpace: 'pre-line' }}>{inv.nota}</p>
        </div>

        {/* Garantía (con el logo de la tienda) */}
        <div style={{ background: '#F4F6F9', borderRadius: 10, padding: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 800, color: NAVY, marginBottom: 4 }}>GARANTÍA</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: TEXT, margin: 0, whiteSpace: 'pre-line' }}>{inv.garantia}</p>
          </div>
          <img
            src="/logo.png"
            alt="Ventura Smart Phone"
            crossOrigin="anonymous"
            style={{ width: 92, height: 92, objectFit: 'contain', flexShrink: 0 }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Pie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `2px solid ${NAVY}` }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: NAVY }}>{NEGOCIO.handle}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: NAVY }}>{NEGOCIO.telefono}</span>
        </div>
      </div>
    </div>
  )
})

export default InvoiceDocument
