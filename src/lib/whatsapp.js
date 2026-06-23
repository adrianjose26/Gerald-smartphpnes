// =========================================================
//  Compartir por WhatsApp (enlace wa.me)
// =========================================================
import { money, fmtInvoiceDate } from './format'

/** Normaliza un teléfono a solo dígitos (con código de país). */
export function normalizePhone(phone = '') {
  let digits = phone.replace(/\D/g, '')
  // Si parece dominicano sin código de país (809/829/849), anteponer 1.
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) digits = '1' + digits
  return digits
}

/** Construye el mensaje de texto de una factura para WhatsApp. */
export function invoiceMessage(invoice, currency = 'DOP') {
  const lines = [
    '*VENTURA SMART PHONE*',
    '_Factura de venta_',
    '',
    `*Fecha:* ${fmtInvoiceDate(invoice.fecha)}`,
    `*Cliente:* ${invoice.clienteNombre || 'Cliente final'}`,
    `*Equipo:* ${invoice.equipo || '-'}`,
    invoice.capacidad ? `*Capacidad:* ${invoice.capacidad}` : null,
    invoice.red ? `*Red:* ${invoice.red}` : null,
    invoice.imei ? `*IMEI/Serial:* ${invoice.imei}` : null,
    `*Precio:* ${money(invoice.precio, currency)}`,
    '',
    '30 días de garantía. ¡Gracias por tu compra!',
    '@VENTURASMARTPHONE · 809-986-1389',
  ].filter(Boolean)
  return lines.join('\n')
}

/** Abre WhatsApp con el mensaje de texto (y teléfono si hay). */
export function shareInvoiceWhatsApp(invoice, phone, currency = 'DOP') {
  const text = encodeURIComponent(invoiceMessage(invoice, currency))
  const num = normalizePhone(phone || '')
  const url = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`
  window.open(url, '_blank', 'noopener')
}

/**
 * Intenta compartir un ARCHIVO (imagen o PDF) usando la Web Share API
 * (nivel 2). En el celular abre la hoja de "Compartir": al elegir WhatsApp,
 * el archivo queda adjuntado en el chat. Devuelve true si se compartió (o el
 * usuario abrió la hoja), false si el navegador no soporta compartir archivos.
 */
export async function shareFile(file, text) {
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, title: 'Factura · Ventura Smart Phone' })
      return true
    }
  } catch (err) {
    // Si el usuario cancela la hoja de compartir, se considera "manejado".
    if (err && err.name === 'AbortError') return true
    console.warn('[share] No se pudo compartir el archivo:', err)
  }
  return false
}
