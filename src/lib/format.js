// =========================================================
//  Utilidades de formato (moneda y fechas)
// =========================================================

/** Símbolos de las monedas soportadas (configurable en Ajustes). */
export const CURRENCIES = {
  DOP: { symbol: 'RD$', label: 'Peso dominicano (RD$)', locale: 'es-DO' },
  USD: { symbol: 'US$', label: 'Dólar estadounidense (US$)', locale: 'en-US' },
  MXN: { symbol: 'MXN', label: 'Peso mexicano (MXN)', locale: 'es-MX' },
}

/** Formatea un número como moneda con el símbolo seleccionado. */
export function money(value, currency = 'DOP') {
  const cfg = CURRENCIES[currency] || CURRENCIES.DOP
  const n = Number(value || 0)
  const formatted = n.toLocaleString(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${cfg.symbol} ${formatted}`
}

/** Fecha corta legible: 22 jun 2026 */
export function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Fecha con hora: 22 jun 2026, 10:48 */
export function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Formato de fecha para la factura: 22/06/2026 */
export function fmtInvoiceDate(value) {
  const d = value ? new Date(value) : new Date()
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Iniciales para avatares (a partir de un nombre). */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}
