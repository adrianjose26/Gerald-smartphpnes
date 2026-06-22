// =========================================================
//  Envío de la factura por WhatsApp
//  ---------------------------------------------------------
//  Estrategia:
//   1) Intenta COMPARTIR el PDF como archivo (Web Share API).
//      En el celular abre la hoja de compartir y, al elegir WhatsApp,
//      el PDF queda adjuntado en el chat.
//   2) Si el navegador no soporta compartir archivos (típico en
//      escritorio), DESCARGA el PDF y abre WhatsApp con el texto, para
//      que solo haya que adjuntar el archivo recién descargado.
// =========================================================
import { invoiceToPdfBlob, downloadBlob } from './pdf'
import { sharePdfFile, shareInvoiceWhatsApp, invoiceMessage } from './whatsapp'

/**
 * @param {HTMLElement} node     nodo del documento de factura a capturar
 * @param {object} factura       factura emitida
 * @param {string} currency      moneda actual
 * @returns {Promise<'share'|'fallback'>}  método usado
 */
export async function enviarFacturaPorWhatsApp(node, factura, currency = 'DOP') {
  const filename = `Factura-${factura.numero}.pdf`
  const { file, blob } = await invoiceToPdfBlob(node, filename)
  const text = invoiceMessage(factura, currency)

  // 1) Compartir el archivo (móvil)
  const shared = await sharePdfFile(file, text)
  if (shared) return 'share'

  // 2) Respaldo (escritorio): descargar PDF + abrir chat con texto
  downloadBlob(blob, filename)
  shareInvoiceWhatsApp(factura, factura.clienteTelefono, currency)
  return 'fallback'
}
