// =========================================================
//  Producto = 1 unidad única (tienda pequeña, una persona).
//  Ya no se controla cantidad: el producto está DISPONIBLE o VENDIDO.
//  El antiguo "estado de stock" se reemplaza por el GRADO del equipo
//  (Tipo A / B / C).
//  Se conservan helpers de movimientos solo para el HISTORIAL.
// =========================================================

/** Efecto numérico de un movimiento (solo para mostrar el historial). */
export function movementDelta(mov) {
  if (mov.tipo === 'entrada') return Math.abs(mov.cantidad)
  if (mov.tipo === 'salida') return -Math.abs(mov.cantidad)
  return mov.cantidad
}

// ---- Grado / condición del producto (Tipo A / B / C) ----
export const TIPO_OPTIONS = ['A', 'B', 'C']
export const TIPO_COLORS = { A: '#16A34A', B: '#D97706', C: '#E11D48' }
export const TIPO_LABEL = { A: 'Tipo A', B: 'Tipo B', C: 'Tipo C' }

/** ¿El producto está disponible (no vendido)? */
export function isDisponible(product) {
  return product?.estado !== 'vendido'
}

/**
 * Etiqueta principal del producto para badges:
 *  - 'Vendido' si ya se facturó
 *  - su grado (Tipo A / B / C) si está disponible
 * Devuelve { key, label, color } compatible con <Badge />.
 */
export function productBadge(product) {
  if (product?.estado === 'vendido') return { key: 'sold', label: 'Vendido', color: '#1F2735' }
  const t = product?.tipo || 'A'
  return { key: t, label: TIPO_LABEL[t] || `Tipo ${t}`, color: TIPO_COLORS[t] || '#687284' }
}
