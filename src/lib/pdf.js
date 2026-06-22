// =========================================================
//  Generación de PDF de la factura
//  Captura el nodo del documento de factura con html2canvas y
//  lo coloca en una página A4 con jsPDF.
// =========================================================
// html2canvas y jsPDF se cargan de forma diferida (dynamic import) para no
// pesar en la carga inicial: solo se descargan al generar el primer PDF.

/**
 * Genera el PDF a partir de un nodo del DOM y lo devuelve como Blob/File,
 * SIN descargarlo. Útil para compartirlo como archivo o descargarlo aparte.
 * @param {HTMLElement} node  nodo a capturar
 * @param {string} filename   nombre del archivo .pdf
 * @returns {Promise<{ blob: Blob, file: File, filename: string }>}
 */
export async function invoiceToPdfBlob(node, filename = 'factura.pdf') {
  if (!node) throw new Error('No hay documento que exportar')

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(node, {
    scale: 2, // mayor nitidez
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })

  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableW = pageW - margin * 2

  // proporción de la imagen respecto al ancho útil
  const imgH = (canvas.height * usableW) / canvas.width
  let heightLeft = imgH
  let position = margin

  pdf.addImage(img, 'PNG', margin, position, usableW, imgH)
  heightLeft -= pageH - margin * 2

  // si el documento es más alto que una página, añade páginas
  while (heightLeft > 0) {
    position = heightLeft - imgH + margin
    pdf.addPage()
    pdf.addImage(img, 'PNG', margin, position, usableW, imgH)
    heightLeft -= pageH - margin * 2
  }

  const blob = pdf.output('blob')
  const file = new File([blob], filename, { type: 'application/pdf' })
  return { blob, file, filename }
}

/** Dispara la descarga de un Blob con el nombre indicado. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Conveniencia: genera el PDF y lo descarga directamente.
 * @returns {Promise<Blob>}
 */
export async function invoiceToPdf(node, filename = 'factura.pdf') {
  const { blob } = await invoiceToPdfBlob(node, filename)
  downloadBlob(blob, filename)
  return blob
}
