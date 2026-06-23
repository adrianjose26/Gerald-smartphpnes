// =========================================================
//  Producto = 1 unidad única (tienda pequeña, una persona).
//  El producto está DISPONIBLE o VENDIDO, y tiene una condición
//  física: NUEVO o USADO (badge principal).
//  Se conservan helpers de movimientos solo para el HISTORIAL.
// =========================================================

/** Efecto numérico de un movimiento (solo para mostrar el historial). */
export function movementDelta(mov) {
  if (mov.tipo === 'entrada') return Math.abs(mov.cantidad)
  if (mov.tipo === 'salida') return -Math.abs(mov.cantidad)
  return mov.cantidad
}

// ---- Condición del producto: Nuevo / Usado ----
export const COND_OPTIONS = ['nuevo', 'usado']
export const COND_LABEL = { nuevo: 'Nuevo', usado: 'Usado' }
export const COND_COLORS = { nuevo: '#16A34A', usado: '#D97706' }

/** ¿El producto está disponible (no vendido)? */
export function isDisponible(product) {
  return product?.estado !== 'vendido'
}

/**
 * Etiqueta principal del producto para badges:
 *  - 'Vendido' si ya se facturó
 *  - 'Nuevo' / 'Usado' si está disponible
 * Devuelve { key, label, color } compatible con <Badge />.
 */
export function productBadge(product) {
  if (product?.estado === 'vendido') return { key: 'sold', label: 'Vendido', color: '#1F2735' }
  const c = product?.nuevoUsado || 'nuevo'
  return { key: c, label: COND_LABEL[c] || 'Nuevo', color: COND_COLORS[c] || '#16A34A' }
}
