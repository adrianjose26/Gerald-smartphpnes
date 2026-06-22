// =========================================================
//  Capa de persistencia AISLADA
//  ---------------------------------------------------------
//  Toda la app habla con el "store" (Zustand) y el store
//  habla ÚNICAMENTE con esta capa. Hoy persiste en localStorage;
//  el día de mañana se puede reemplazar el cuerpo de estas
//  funciones por llamadas a Supabase sin tocar la UI.
//
//  Las funciones son asíncronas a propósito (devuelven Promesas)
//  para que migrar a un backend remoto no cambie las firmas.
// =========================================================

const PREFIX = 'vsp:' // namespace de Ventura Smart Phone

/** Lee una colección/clave; devuelve `fallback` si no existe o falla el parseo. */
export async function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[storage] No se pudo leer "${key}":`, err)
    return fallback
  }
}

/** Escribe (reemplaza) una colección/clave. */
export async function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`[storage] No se pudo guardar "${key}":`, err)
    return false
  }
}

/** Borra una clave. */
export async function remove(key) {
  localStorage.removeItem(PREFIX + key)
}

/** ¿Está la base inicializada? (para sembrar datos de ejemplo solo la 1ª vez) */
export async function isSeeded() {
  return localStorage.getItem(PREFIX + 'seeded') === '1'
}

export async function markSeeded() {
  localStorage.setItem(PREFIX + 'seeded', '1')
}

/** Genera un identificador único. */
export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
