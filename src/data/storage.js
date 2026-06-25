// =========================================================
//  Capa de persistencia AISLADA — ahora en Supabase (nube)
//  ---------------------------------------------------------
//  Toda la app habla con el "store" (Zustand) y el store habla
//  ÚNICAMENTE con esta capa. Cada colección (productos, clientes…)
//  se guarda como un JSON en la tabla `app_state`, atada al usuario
//  que inició sesión (RLS: cada quien solo ve sus datos).
//
//  Así los datos se sincronizan entre la PC y el celular: ambos leen
//  y escriben en la misma cuenta en la nube.
// =========================================================
import { supabase } from '../lib/supabase'

const TABLE = 'app_state'

/** Id del usuario con sesión activa (lee la sesión local, sin red). */
async function currentUserId() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user?.id || null
}

/** Lee una colección/clave; devuelve `fallback` si no existe o falla. */
export async function read(key, fallback = null) {
  try {
    const { data, error } = await supabase.from(TABLE).select('value').eq('key', key).maybeSingle()
    if (error) throw error
    return data ? data.value : fallback
  } catch (err) {
    console.warn(`[storage] No se pudo leer "${key}":`, err)
    return fallback
  }
}

/** Escribe (reemplaza) una colección/clave para el usuario actual. */
export async function write(key, value) {
  try {
    const user_id = await currentUserId()
    if (!user_id) return false // sin sesión no se guarda
    const { error } = await supabase
      .from(TABLE)
      .upsert({ user_id, key, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })
    if (error) throw error
    return true
  } catch (err) {
    console.error(`[storage] No se pudo guardar "${key}":`, err)
    return false
  }
}

/** Borra una clave del usuario actual. */
export async function remove(key) {
  try {
    await supabase.from(TABLE).delete().eq('key', key)
  } catch (err) {
    console.error(`[storage] No se pudo borrar "${key}":`, err)
  }
}

/** ¿Ya se inicializó la cuenta? (para sembrar las categorías solo la 1ª vez) */
export async function isSeeded() {
  const v = await read('seeded', null)
  return v === true || v === '1'
}

export async function markSeeded() {
  await write('seeded', true)
}

/** Genera un identificador único. */
export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
