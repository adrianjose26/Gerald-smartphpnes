// =========================================================
//  Generación de PDF / imagen de la factura
//  ---------------------------------------------------------
//  El documento se captura SIEMPRE a un ancho fijo (igual en PC y
//  celular) clonándolo en un contenedor oculto. Así la factura sale
//  con el mismo tamaño/proporción sin importar el dispositivo.
//  html2canvas y jsPDF se cargan de forma diferida (dynamic import).
// =========================================================

const FIXED_WIDTH = 720 // ancho del documento (igual al de escritorio)

/** Espera a que todas las imágenes de un nodo terminen de cargar. */
function waitForImages(node) {
  const imgs = Array.from(node.querySelectorAll('img'))
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res
            img.onerror = res
          })
    )
  )
}

/**
 * Captura un nodo a un <canvas> con ANCHO FIJO, independientemente del
 * dispositivo: clona el nodo en un contenedor oculto de ancho fijo y
 * captura ese clon (así no importa lo angosta que sea la pantalla).
 */
async function renderCanvas(node, width = FIXED_WIDTH) {
  if (!node) throw new Error('No hay documento que exportar')
  const { default: html2canvas } = await import('html2canvas')

  // Contenedor oculto de ancho fijo
  const wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${width + 24}px`,
    background: '#ffffff',
  })

  const clone = node.cloneNode(true)
  clone.style.width = `${width}px`
  clone.style.maxWidth = `${width}px`
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    await waitForImages(clone)
    return await html2canvas(clone, {
      scale: 2, // mayor nitidez
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: width + 24,
    })
  } finally {
    document.body.removeChild(wrapper)
  }
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
 * Genera el PDF (ancho fijo) y lo devuelve como Blob/File, sin descargarlo.
 * @returns {Promise<{ blob: Blob, file: File, filename: string }>}
 */
export async function invoiceToPdfBlob(node, filename = 'factura.pdf') {
  const canvas = await renderCanvas(node)
  const { jsPDF } = await import('jspdf')

  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableW = pageW - margin * 2

  const imgH = (canvas.height * usableW) / canvas.width
  let heightLeft = imgH
  let position = margin

  pdf.addImage(img, 'PNG', margin, position, usableW, imgH)
  heightLeft -= pageH - margin * 2

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

/** Conveniencia: genera el PDF y lo descarga directamente. */
export async function invoiceToPdf(node, filename = 'factura.pdf') {
  const { blob } = await invoiceToPdfBlob(node, filename)
  downloadBlob(blob, filename)
  return blob
}

/**
 * Genera una IMAGEN (JPG) de la factura a ancho fijo, sin descargarla.
 * Ideal para enviar por WhatsApp (se ve en el chat al instante y siempre
 * con el mismo tamaño).
 * @returns {Promise<{ blob: Blob, file: File, filename: string }>}
 */
export async function invoiceToImageBlob(node, filename = 'factura.jpg') {
  const canvas = await renderCanvas(node)
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95))
  const file = new File([blob], filename, { type: 'image/jpeg' })
  return { blob, file, filename }
}

/** Conveniencia: genera la imagen JPG y la descarga. */
export async function invoiceToImage(node, filename = 'factura.jpg') {
  const { blob } = await invoiceToImageBlob(node, filename)
  downloadBlob(blob, filename)
  return blob
}
