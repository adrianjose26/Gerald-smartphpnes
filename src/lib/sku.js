// =========================================================
//  Autogeneración de código / SKU
//  Si el usuario deja el código vacío, se genera uno legible
//  a partir de la categoría y un consecutivo aleatorio corto.
// =========================================================

/** Toma las primeras letras significativas de un texto. */
function prefixFrom(text = 'PRD') {
  const clean = text.normalize('NFD').replace(/[^a-zA-Z]/g, '')
  return (clean.slice(0, 3) || 'PRD').toUpperCase()
}

/** Genera un SKU del tipo CEL-7F3K2. */
export function generateSku(categoryName) {
  const prefix = prefixFrom(categoryName)
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${rand}`
}
