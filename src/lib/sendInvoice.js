// =========================================================
//  Envío de la factura por WhatsApp
//  ---------------------------------------------------------
//  Se envía como IMAGEN (JPG): en WhatsApp se ve directo en el chat,
//  es más fácil de mandar que un PDF y se previsualiza al instante.
//  Estrategia:
//   1) Intenta COMPARTIR la imagen como archivo (Web Share API).
//      En el celular abre la hoja de compartir y, al elegir WhatsApp,
//      la imagen queda adjuntada en el chat.
//   2) Si el navegador no soporta compartir archivos (típico en
//      escritorio), DESCARGA la imagen y abre WhatsApp con el texto,
//      para que solo haya que adjuntar la imagen recién descargada.
// =========================================================
import { invoiceToImageBlob, downloadBlob } from './pdf'
import { shareFile, shareInvoiceWhatsApp, invoiceMessage } from './whatsapp'

/**
 * @param {HTMLElement} node     nodo del documento de factura a capturar
 * @param {object} factura       factura emitida
 * @param {string} currency      moneda actual
 * @returns {Promise<'share'|'fallback'>}  método usado
 */
export async function enviarFacturaPorWhatsApp(node, factura, currency = 'DOP') {
  const filename = `Factura-${factura.numero}.jpg`
  const { file, blob } = await invoiceToImageBlob(node, filename)
  const text = invoiceMessage(factura, currency)

  // 1) Compartir la imagen (móvil)
  const shared = await shareFile(file, text)
  if (shared) return 'share'

  // 2) Respaldo (escritorio): descargar la imagen + abrir chat con texto
  downloadBlob(blob, filename)
  shareInvoiceWhatsApp(factura, factura.clienteTelefono, currency)
  return 'fallback'
}
